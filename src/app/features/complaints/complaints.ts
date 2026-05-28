import { Component, inject, computed, signal, ViewChild, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ComplaintsService } from '../../shared/services/complaints.service';
import { DataListComponent } from '../../shared/components/data-list/data-list';
import { ColumnDef, LoadFn } from '../../shared/components/data-list/data-list.types';
import { ExportDialogComponent } from '../../shared/components/export-dialog/export-dialog.component';
import { TaskAssignmentDialogComponent } from '../../shared/components/task-assignment-dialog/task-assignment-dialog';
import { UserService } from '../../core/services/user.service';
import { TaskService } from '../../shared/services/task.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { BaseListService } from '../../shared/services/base-list.service';
import {
  ComplaintDTO,
  ComplaintStatusEnum,
  PaginatedApiResponse,
  UserRoleEnum,
  AssignmentTask,
  SelectOption,
} from '../../shared/models';

@Component({
  selector: 'complaints-page',
  imports: [DataListComponent],
  templateUrl: './complaints.html',
  styleUrls: ['./complaints.scss'],
})
export class ComplaintsComponent extends BaseListService implements OnInit {
  private complaintsService = inject(ComplaintsService);
  private taskService = inject(TaskService);
  override userService = inject(UserService);

  @ViewChild(DataListComponent) dataList?: DataListComponent;

  ngOnInit(): void {
    this.loadDepartments();
  }

  readonly pageTitle = signal('Complaints');

  private readonly baseColumnDefs: ColumnDef<ComplaintDTO>[] = [
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
        htmlCell: (row: ComplaintDTO) => {
          const name = row.employeeName || `User #${row.employeeId}`;
          const initials = this.getInitials(name);
          return `<div class="employee-badge"><div class="avatar-circle">${initials}</div><span class="employee-name">${name}</span></div>`;
        },
      });
      cols.splice(4, 0, {
        key: 'departmentName',
        header: 'Department',
      });
    }

    cols.push(
      { key: 'status', header: 'Status', isStatus: true },
      {
        key: 'createdAt',
        header: 'Created',
        cell: (row) => this.formatDate(row.createdAt),
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
          routerLink: (row: ComplaintDTO) => ['/complaints', String(row.id)],
        },
        ...(this.userService.isResponsible() && this.userService.isInSupportMode()
          ? [
              {
                icon: 'assignment',
                tooltip: 'Assign task',
                click: (row: ComplaintDTO) => this.assignTask('COMPLAINT', row.id),
              },
            ]
          : []),
      ],
    });

    return cols;
  });

  readonly statusOptions: SelectOption[] = [
    { value: ComplaintStatusEnum.NEW, label: 'New' },
    { value: ComplaintStatusEnum.IN_REVIEW, label: 'In Review' },
    { value: ComplaintStatusEnum.IN_PROGRESS, label: 'In Progress' },
    { value: ComplaintStatusEnum.RESOLVED, label: 'Resolved' },
    { value: ComplaintStatusEnum.CLOSED, label: 'Closed' },
    { value: ComplaintStatusEnum.REJECTED, label: 'Rejected' },
  ];

  readonly loadFn: LoadFn<ComplaintDTO> = (pagination, filters) => {
    const currentUser = this.userService.currentUser();
    const isInSupportMode = this.userService.isInSupportMode();
    const canAccessSupportView =
      currentUser?.role === 'ADMIN' ||
      currentUser?.role === 'DEPT_RESPONSIBLE';
    const isInAdminView = isInSupportMode && canAccessSupportView;

    const updatedFilters = {
      ...filters,
      employeeId: isInAdminView || filters?.departmentId ? undefined : currentUser?.id,
    };

    return this.complaintsService.getComplaints(pagination, updatedFilters).pipe(
      map((response: PaginatedApiResponse<ComplaintDTO>) => ({
        items: (response.data?.items ?? []).sort((a, b) => b.id - a.id),
        total: response.data?.total ?? 0,
      }))
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
          const endpoint = format === 'pdf' ? 'reports/complaints' : 'reports/complaints/csv';
          const filename = `complaints_report.${format}`;

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

  assignTask(itemType: string, itemId: string | number): void {
    this.dialog
      .open(TaskAssignmentDialogComponent)
      .afterClosed()
      .subscribe((result: { employeeId?: number }) => {
        if (result?.employeeId) {
          const task: AssignmentTask = {
            id: 0,
            itemType,
            itemId: Number(itemId),
            acceptedBy: result.employeeId,
          };
          this.taskService.createTask(task).subscribe({
            next: () => {
              this.snackbarService.success('Task assigned successfully');
              this.dataList?.loadData();
            },
            error: (error: { error?: { message?: string } }) => {
              const msg = error?.error?.message || 'Failed to assign task';
              this.snackbarService.error(msg);
            },
          });
        }
      });
  }
}
