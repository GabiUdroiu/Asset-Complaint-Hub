import { Component, inject, computed, signal, ViewChild } from '@angular/core';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ComplaintsService, ComplaintDTO } from '../../shared/services/complaints.service';
import { DataListComponent } from '../../shared/components/data-list/data-list';
import { ColumnDef, SelectOption, LoadFn } from '../../shared/components/data-list/data-list.types';
import { ExportDialogComponent } from '../../shared/components/export-dialog/export-dialog.component';
import { TaskAssignmentDialogComponent } from '../../shared/components/task-assignment-dialog/task-assignment-dialog';
import { UserService } from '../../core/services/user.service';
import { ApiService } from '../../shared/services/api.service';
import { TaskService } from '../../shared/services/task.service';
import { SnackbarService } from '../../shared/services/snackbar.service';

@Component({
    selector: 'complaints-page',
    imports: [DataListComponent],
    templateUrl: './complaints.html',
    styleUrls: ['./complaints.scss'],
})
export class ComplaintsComponent {
    private complaintsService = inject(ComplaintsService);
    private apiService = inject(ApiService);
    private dialog = inject(MatDialog);
    private taskService = inject(TaskService);
    private snackbarService = inject(SnackbarService);
    userService = inject(UserService);

    @ViewChild(DataListComponent) dataList?: DataListComponent;

    department = signal<string | null>(null);

    readonly departmentOptions: SelectOption[] = [
        { value: 'IT', label: 'IT' },
        { value: 'HR', label: 'HR' },
        { value: 'Sales', label: 'Sales' },
        { value: 'Finance', label: 'Finance' },
    ];

    pageTitle = signal('Complaints');

    readonly baseColumnDefs: ColumnDef<ComplaintDTO>[] = [
        { key: 'id', header: 'ID', cell: (row) => `#${row.id}` },
        { key: 'title', header: 'Title' },
        { key: 'asset', header: 'Asset', cell: (row) => `Asset #${row.assetId}` },
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

        cols.push(
            { key: 'status', header: 'Status', isStatus: true },
            {
                key: 'createdAt',
                header: 'Created',
                cell: (row) =>
                    row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                          })
                        : '',
            }
        );
        cols.push({
            key: 'actions',
            header: 'Actions',
            isActions: true,
            actions: [
                {
                    icon: 'visibility',
                    tooltip: 'View details',
                    routerLink: (row) => ['/complaints', String(row.id)],
                },
                ...(this.userService.isResponsible() && this.userService.isInSupportMode() ? [{
                    icon: 'assignment',
                    tooltip: 'Assign task',
                    click: (row: ComplaintDTO) => this.assignTask('COMPLAINT', row.id),
                }] : []),
            ],
        });
        return cols;
    });

    readonly statusOptions: SelectOption[] = [
        { value: 'NEW', label: 'New' },
        { value: 'IN_REVIEW', label: 'In Review' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'RESOLVED', label: 'Resolved' },
        { value: 'CLOSED', label: 'Closed' },
        { value: 'REJECTED', label: 'Rejected' },
    ];

    readonly loadFn: LoadFn<ComplaintDTO> = (pagination, filters) => {
        const updatedFilters = {
            ...filters,
            employeeId: this.userService.isInSupportMode()
                ? undefined
                : this.userService.currentUser()?.id,
        };
        return this.complaintsService.getComplaints(pagination, updatedFilters).pipe(
            map((response) => ({
                items: response.data?.items ?? [],
                total: response.data?.total ?? 0,
            })),
        );
    };

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
        const endpoint = format === 'pdf' ? 'reports/complaints' : 'reports/complaints/csv';
        const filename = `complaints_report.${format}`;
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
