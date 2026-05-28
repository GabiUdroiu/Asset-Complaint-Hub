import { Component, inject, signal, computed, ViewChild, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataListComponent } from '../../shared/components/data-list/data-list';
import { ColumnDef, LoadFn } from '../../shared/components/data-list/data-list.types';
import { ExportDialogComponent } from '../../shared/components/export-dialog/export-dialog.component';
import { TaskAssignmentDialogComponent } from '../../shared/components/task-assignment-dialog/task-assignment-dialog';
import { AssetSelectionDialogComponent } from './asset-selection-dialog/asset-selection-dialog';
import { Demand, Asset, SelectOption } from '../../shared/models';
import { UserService } from '../../core/services/user.service';
import { TaskService } from '../../shared/services/task.service';
import { BaseListService } from '../../shared/services/base-list.service';
import { RequestsService } from '../../shared/services/requests.service';

@Component({
    selector: 'requests-page',
    imports: [DataListComponent],
    templateUrl: './requests.html',
    styleUrls: ['./requests.scss'],
})
export class RequestsComponent extends BaseListService implements OnInit {
    private requestsService = inject(RequestsService);
    private taskService = inject(TaskService);
    override userService = inject(UserService);

    @ViewChild(DataListComponent) dataList?: DataListComponent;

    ngOnInit(): void {
        this.loadDepartments();
    }

    pageTitle = signal('Requests');

    readonly baseColumnDefs: ColumnDef<Demand>[] = [
        { key: 'id', header: 'ID', cell: (row) => `#${row.id}` },
        { key: 'title', header: 'Title' },
        { key: 'description', header: 'Description' },
        { key: 'status', header: 'Status', isStatus: true },
        {
            key: 'createdAt',
            header: 'Created',
            cell: (row: Demand) => this.formatDate(row.createdAt),
        },
    ];

    readonly columnDefs = computed(() => {
        const cols = [...this.baseColumnDefs];
        if (this.userService.isInSupportMode()) {
            cols.splice(3, 0, {
                key: 'employeeName',
                header: 'Employee',
                htmlCell: (row: Demand) => {
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
        { value: 'PENDING', label: 'Pending' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'COMPLETED', label: 'Completed' },
    ];


    readonly loadFn: LoadFn<Demand> = (pagination, filters) => {
        const currentUser = this.userService.currentUser();
        const isInSupportMode = this.userService.isInSupportMode();
        const canAccessSupportView = currentUser?.role === 'ADMIN' || currentUser?.role === 'DEPT_RESPONSIBLE';
        const isInAdminView = isInSupportMode && canAccessSupportView;

        const employeeId = isInAdminView || filters?.departmentId ? undefined : currentUser?.id;

        return this.requestsService.getRequests(pagination, {
            search: filters?.search,
            status: filters?.status,
            departmentId: filters?.departmentId,
            employeeId,
        }).pipe(
            map((response) => ({
                items: (response.data?.items ?? []).sort((a, b) => b.id - a.id),
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
                    const format = result.format as 'pdf' | 'csv';
                    const scope = result.scope as 'with-filters' | 'all';
                    const endpoint = format === 'pdf' ? 'reports/requests' : 'reports/requests/csv';
                    const filename = `requests_report.${format}`;

                    const currentUser = this.userService.currentUser();
                    const isInSupportMode = this.userService.isInSupportMode();
                    const canAccessSupportView = currentUser?.role === 'ADMIN' || currentUser?.role === 'DEPT_RESPONSIBLE';
                    const isInAdminView = isInSupportMode && canAccessSupportView;
                    const employeeId = (isInAdminView) ? undefined : currentUser?.id;

                    const filters = {
                        search: this.dataList?.filterSearch?.() || undefined,
                        status: this.dataList?.filterStatus?.() || undefined,
                        departmentId: this.dataList?.filterDepartment?.() ? Number(this.dataList.filterDepartment()) : undefined,
                        employeeId: employeeId,
                    };
                    this.downloadReport(endpoint, filename, format, scope, filters);
                }
            });
    };

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

    private createRequestWithAssets(assets: Asset[]): void {
        const assetDetails = assets.map((a) => `${a.id} - ${a.name}`).join(', ');
        const requestPayload = {
            title: `Asset Request - ${assets.length} item(s)`,
            description: `Auto-created request for assets: ${assetDetails}`,
            status: 'PENDING',
            employeeId: this.userService.currentUser()?.id,
        };

        this.requestsService.createRequest(requestPayload).subscribe({
            next: () => {
                this.snackbarService.success(`Request created successfully`);
                if (this.dataList) {
                    this.dataList.loadData();
                }
            },
            error: (error: { error?: { message?: string } }) => {
                const errorMsg = error?.error?.message || 'Failed to create request';
                this.snackbarService.error(errorMsg);
            },
        });
    }

    override getInitials(name: string): string {
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
            .subscribe((result: { employeeId?: number }) => {
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
                        error: (error: { error?: { message?: string } }) => {
                            const msg = error?.error?.message || 'Failed to assign task';
                            this.snackbarService.error(msg);
                        }
                    });
                }
            });
    }
}
