import { Component, inject, signal, computed, ViewChild } from '@angular/core';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../shared/services/api.service';
import { DataListComponent } from '../../shared/components/data-list/data-list';
import { ColumnDef, SelectOption, LoadFn } from '../../shared/components/data-list/data-list.types';
import { ExportDialogComponent } from '../../shared/components/export-dialog/export-dialog.component';
import { TaskAssignmentDialogComponent } from '../../shared/components/task-assignment-dialog/task-assignment-dialog';
import { AssetSelectionDialogComponent } from './asset-selection-dialog/asset-selection-dialog';
import { Demand } from '../../shared/models';
import { UserService } from '../../core/services/user.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { TaskService } from '../../shared/services/task.service';

@Component({
    selector: 'requests-page',
    standalone: true,
    imports: [DataListComponent],
    templateUrl: './requests.html',
    styleUrls: ['./requests.scss'],
})
export class RequestsComponent {
    private apiService = inject(ApiService);
    private dialog = inject(MatDialog);
    private snackbarService = inject(SnackbarService);
    private taskService = inject(TaskService);
    userService = inject(UserService);

    @ViewChild(DataListComponent) dataList?: DataListComponent;

    department = signal<string | null>(null);

    readonly departmentOptions: SelectOption[] = [
        { value: 'IT', label: 'IT' },
        { value: 'HR', label: 'HR' },
        { value: 'Sales', label: 'Sales' },
        { value: 'Finance', label: 'Finance' },
    ];

    pageTitle = signal('Requests');

    readonly baseColumnDefs: ColumnDef<Demand>[] = [
        { key: 'id', header: 'ID', cell: (row) => `#${row.id}` },
        { key: 'title', header: 'Title' },
        { key: 'description', header: 'Description' },
        { key: 'status', header: 'Status', isStatus: true },
        {
            key: 'createdAt',
            header: 'Created',
            cell: (row: any) => this.formatDate(row.createdAt),
        },
    ];

    readonly columnDefs = computed(() => {
        const cols = [...this.baseColumnDefs];
        if (this.userService.isInSupportMode()) {
            cols.splice(3, 0, {
                key: 'employeeName',
                header: 'Employee',
                htmlCell: (row: any) => {
                    const name = row.employeeName || `User #${row.employeeId}`;
                    const initials = this.getInitials(name);
                    return `<div class="employee-badge"><div class="avatar-circle">${initials}</div><span class="employee-name">${name}</span></div>`;
                }
            });
            cols.splice(4, 0, {
                key: 'departmentName',
                header: 'Department'
            });
        }
        cols.push({
            key: 'actions',
            header: 'Actions',
            isActions: true,
            actions: [
                {
                    icon: 'visibility',
                    tooltip: 'View details',
                    routerLink: (row) => ['/requests', String(row.id)],
                },
                ...(this.userService.isResponsible() && this.userService.isInSupportMode() ? [{
                    icon: 'assignment',
                    tooltip: 'Assign task',
                    click: (row: Demand) => this.assignTask('REQUEST', row.id),
                }] : []),
            ],
        });
        return cols;
    });

    readonly statusOptions: SelectOption[] = [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'completed', label: 'Completed' },
    ];


    readonly loadFn: LoadFn<Demand> = (pagination, filters) => {
        let url = 'requests';
        const params = new URLSearchParams();

        const employeeId = this.userService.isInSupportMode()
            ? undefined
            : this.userService.currentUser()?.id;

        if (pagination?.page !== undefined) params.append('page', pagination.page.toString());
        if (pagination?.size !== undefined) params.append('size', pagination.size.toString());
        if (filters?.search) params.append('search', filters.search);
        if (filters?.status) params.append('status', filters.status);
        if (employeeId !== undefined) params.append('employeeId', employeeId.toString());

        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;

        return this.apiService.get<any>(url).pipe(
            map((response) => ({
                items: response.data?.items ?? [],
                total: response.data?.total ?? 0,
            })),
        );
    };

    formatDate(date: any): string {
        return date
            ? new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
              })
            : '';
    }

    openDownloadMenu = (): void => {
        this.dialog
            .open(ExportDialogComponent)
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.downloadReport(result.format, result.scope);
                }
            });
    };

    downloadReport(format: 'pdf' | 'csv', scope: 'with-filters' | 'all'): void {
        const endpoint = format === 'pdf' ? 'reports/requests' : 'reports/requests/csv';
        const filename = `requests_report.${format}`;
        const params = scope === 'all' ? { exportAll: true } : {};

        this.apiService.getBlob(endpoint, params).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => alert(`Failed to download ${format.toUpperCase()} report`),
        });
    }

    openAssetSelection = (): void => {
        this.dialog
            .open(AssetSelectionDialogComponent)
            .afterClosed()
            .subscribe((assets) => {
                if (assets !== null && assets !== undefined && assets.length > 0) {
                    this.createRequestWithAssets(assets);
                }
            });
    };

    private createRequestWithAssets(assets: any[]): void {
        const assetDetails = assets.map((a) => `${a.id} - ${a.name}`).join(', ');
        const requestPayload = {
            title: `Asset Request - ${assets.length} item(s)`,
            description: `Auto-created request for assets: ${assetDetails}`,
            status: 'PENDING',
            employeeId: this.userService.currentUser()?.id,
        };

        this.apiService.post('requests', requestPayload).subscribe({
            next: () => {
                this.snackbarService.success(`Request created successfully`);
                if (this.dataList) {
                    this.dataList.loadData();
                }
            },
            error: (error: any) => {
                console.error('Request creation error:', error);
                const errorMsg = error?.error?.message || 'Failed to create request';
                this.snackbarService.error(errorMsg);
            },
        });
    }

    getInitials(name: string): string {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    assignTask(itemType: string, itemId: string | number): void {
        this.dialog
            .open(TaskAssignmentDialogComponent)
            .afterClosed()
            .subscribe((result) => {
                if (result?.employeeId) {
                    const task = {
                        itemType,
                        itemId: Number(itemId),
                        acceptedBy: result.employeeId,
                    };
                    this.taskService.createTask(task).subscribe({
                        next: () => {
                            this.snackbarService.success('Task assigned successfully');
                            if (this.dataList) {
                                this.dataList.loadData();
                            }
                        },
                        error: (error: any) => {
                            const msg = error?.error?.message || 'Failed to assign task';
                            this.snackbarService.error(msg);
                        }
                    });
                }
            });
    }
}
