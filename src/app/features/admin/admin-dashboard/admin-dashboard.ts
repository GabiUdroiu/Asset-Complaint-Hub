import {
    Component,
    OnInit,
    inject,
    signal,
    ViewChild,
    ElementRef,
    AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService, ApiResponse } from '../../../shared/services/api.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { UserService } from '../../../core/services/user.service';
import { AssetDTO, EmployeeDTO, ComplaintDTO, RequestDTO, DepartmentDTO } from '../../../shared/models';
import { ListCacheService } from '../../../shared/services/list-cache.service';
import { AddAssetDialogComponent } from '../dialogs/add-asset-dialog.component';
import { AddEmployeeDialogComponent } from '../dialogs/add-employee-dialog.component';
import { AddDepartmentDialogComponent } from '../dialogs/add-department-dialog.component';
import { EditAssetDialogComponent } from '../dialogs/edit-asset-dialog.component';
import { EditEmployeeDialogComponent } from '../dialogs/edit-employee-dialog.component';
import { EditDepartmentDialogComponent } from '../dialogs/edit-department-dialog.component';
import { AssetDetailDialogComponent } from '../../assets/asset-detail-dialog/asset-detail-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ExportDialogComponent } from '../../../shared/components/export-dialog/export-dialog.component';
import { AdminFilterBarComponent } from '../components/admin-filter-bar.component';
import {
    Chart as ChartJS,
    ChartConfiguration,
    DoughnutController,
    BarController,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    DoughnutController,
    BarController,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
);

@Component({
    selector: 'admin-dashboard',
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        MatButtonModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatTabsModule,
        MatDialogModule,
        MatTooltipModule,
        AdminFilterBarComponent,
    ],
    templateUrl: './admin-dashboard.html',
    styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
    private apiService = inject(ApiService);
    private snackbarService = inject(SnackbarService);
    private dialog = inject(MatDialog);
    private userService = inject(UserService);
    private listCache = inject(ListCacheService);

    @ViewChild('complaintsChart', { read: ElementRef })
    complaintsChartRef?: ElementRef<HTMLCanvasElement>;
    @ViewChild('requestsChart', { read: ElementRef })
    requestsChartRef?: ElementRef<HTMLCanvasElement>;

    assets = signal<AssetDTO[]>([]);
    employees = signal<EmployeeDTO[]>([]);
    complaints = signal<ComplaintDTO[]>([]);
    requests = signal<RequestDTO[]>([]);
    departments = signal<DepartmentDTO[]>([]);

    assetSearch = '';
    employeeSearch = '';
    departmentSearch = '';
    activitySearch = '';
    overviewSearch = '';
    dateFilter = 'all';

    employeeRoleFilter = '';

    assetStatusOptions = [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
        { label: 'Maintenance', value: 'MAINTENANCE' },
    ];

    assetCategoryOptions = [
        { label: 'Laptop', value: 'Laptop' },
        { label: 'Desktop', value: 'Desktop' },
        { label: 'Monitor', value: 'Monitor' },
        { label: 'Phone', value: 'Phone' },
        { label: 'Tablet', value: 'Tablet' },
        { label: 'Printer', value: 'Printer' },
        { label: 'Keyboard', value: 'Keyboard' },
        { label: 'Mouse', value: 'Mouse' },
    ];

    employeeRoleOptions = [
        { label: 'User', value: 'USER' },
        { label: 'Dept Responsible', value: 'DEPT_RESPONSIBLE' },
        { label: 'Admin', value: 'ADMIN' },
    ];

    assetColumns = ['id', 'name', 'serialNumber', 'category', 'status', 'actions'];
    employeeColumns = ['id', 'name', 'email', 'role', 'actions'];
    departmentColumns = ['id', 'name', 'responsibleEmployee', 'actions'];
    complaintColumns = ['id', 'title', 'status', 'created', 'actions'];
    requestColumns = ['id', 'title', 'status', 'created', 'actions'];
    activityColumns = ['type', 'item', 'acceptedBy', 'status', 'date'];

    filteredAssets = signal<AssetDTO[]>([]);
    filteredEmployees = signal<EmployeeDTO[]>([]);
    filteredDepartments = signal<DepartmentDTO[]>([]);

    assetPageIndex = signal(0);
    assetPageSize = signal(10);
    assetTotal = signal(0);

    employeePageIndex = signal(0);
    employeePageSize = signal(10);
    employeeTotal = signal(0);

    departmentPageIndex = signal(0);
    departmentPageSize = signal(10);
    departmentTotal = signal(0);

    activityLog = signal<any[]>([]);
    activityPageIndex = signal(0);
    activityPageSize = signal(10);
    activityTotal = signal(0);

    complaintsChart: ChartJS | null = null;
    requestsChart: ChartJS | null = null;

    canCreateItems() {
        return this.userService.currentUser()?.role === 'ADMIN';
    }

    canManageEmployee(employee: EmployeeDTO): boolean {
        const user = this.userService.currentUser();
        if (user?.role === 'ADMIN') return true;
        if (user?.role === 'DEPT_RESPONSIBLE' && user?.department) {
            const dept = this.departments().find(d => d.name === user.department);
            return employee.departmentId === dept?.id;
        }
        return false;
    }

    canManageDepartment(department: DepartmentDTO): boolean {
        const user = this.userService.currentUser();
        if (user?.role === 'ADMIN') return true;
        if (user?.role === 'DEPT_RESPONSIBLE' && department.responsibleEmployeeId === user.id) {
            return true;
        }
        return false;
    }

    canManageAsset(asset: AssetDTO): boolean {
        const user = this.userService.currentUser();
        if (user?.role === 'ADMIN') return true;
        if (user?.role === 'DEPT_RESPONSIBLE') {
            const employee = this.employees().find(e => e.id === asset.employeeId);
            if (!employee) return false;
            const dept = this.departments().find(d => d.name === user.department);
            return employee.departmentId === dept?.id;
        }
        return false;
    }

    getInitials(name: string): string {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    ngOnInit() {
        this.loadAssets();
        this.loadEmployees();
        this.loadDepartments();
        this.loadComplaints();
        this.loadRequests();
        this.loadActivityLog();
    }

    ngAfterViewInit() {
        setTimeout(() => this.updateCharts(), 500);
    }

    loadAssets() {
        const page = this.assetPageIndex();
        const size = this.assetPageSize();
        this.apiService
            .get<{ items: AssetDTO[]; total: number }>(`assets?page=${page}&size=${size}&unfiltered=true`)
            .subscribe({
                next: (response: ApiResponse<{ items: AssetDTO[]; total: number }>) => {
                    const items = (response.data?.items ?? []).sort((a, b) => b.id - a.id);
                    this.assets.set(items);
                    this.filteredAssets.set(items);
                    this.assetTotal.set(items.length);
                },
                error: () => this.snackbarService.error('Failed to load assets'),
            });
    }

    loadEmployees() {
        const page = this.employeePageIndex();
        const size = this.employeePageSize();
        this.apiService
            .get<{ items: EmployeeDTO[]; total: number }>(`employees?page=${page}&size=${size}`)
            .subscribe({
                next: (response: ApiResponse<{ items: EmployeeDTO[]; total: number }>) => {
                    const items = (response.data?.items ?? []).sort((a, b) => b.id - a.id);
                    this.employees.set(items);
                    this.filteredEmployees.set(items);
                    this.employeeTotal.set(items.length);
                },
                error: () => this.snackbarService.error('Failed to load employees'),
            });
    }

    loadDepartments() {
        const page = this.departmentPageIndex();
        const size = this.departmentPageSize();
        this.apiService
            .get<{ items: DepartmentDTO[]; total: number }>(`departments?page=${page}&size=${size}`)
            .subscribe({
                next: (response: ApiResponse<{ items: DepartmentDTO[]; total: number }>) => {
                    const items = (response.data?.items ?? []).sort((a, b) => b.id - a.id);
                    this.departments.set(items);
                    this.filteredDepartments.set(items);
                    this.departmentTotal.set(response.data?.total ?? 0);
                },
                error: () => this.snackbarService.error('Failed to load departments'),
            });
    }

    loadComplaints() {
        this.apiService.get<{ items: ComplaintDTO[] }>('complaints?page=0&size=100').subscribe({
            next: (response: ApiResponse<{ items: ComplaintDTO[] }>) => {
                const items = (response.data?.items ?? []).sort((a, b) => b.id - a.id);
                this.complaints.set(items);
            },
            error: () => this.snackbarService.error('Failed to load complaints'),
        });
    }

    loadRequests() {
        this.apiService.get<{ items: RequestDTO[] }>('requests?page=0&size=100').subscribe({
            next: (response: ApiResponse<{ items: RequestDTO[] }>) => {
                const items = (response.data?.items ?? []).sort((a, b) => b.id - a.id);
                this.requests.set(items);
            },
            error: () => this.snackbarService.error('Failed to load requests'),
        });
    }


    assetStatusFilter = '';
    assetCategoryFilter = '';

    filterAssets() {
        let filtered = this.assets();

        // Apply search filter
        if (this.assetSearch.trim()) {
            const search = this.assetSearch.toLowerCase();
            filtered = filtered.filter(
                (a) =>
                    a.name.toLowerCase().includes(search) ||
                    a.serialNumber.toLowerCase().includes(search) ||
                    a.category.toLowerCase().includes(search),
            );
        }

        // Apply status filter
        if (this.assetStatusFilter) {
            filtered = filtered.filter((a) => a.status === this.assetStatusFilter);
        }

        // Apply category filter
        if (this.assetCategoryFilter) {
            filtered = filtered.filter((a) => a.category === this.assetCategoryFilter);
        }

        this.filteredAssets.set(filtered);
        this.assetPageIndex.set(0);
    }

    onAssetFilterChange(filters: { status?: string; category?: string; role?: string }) {
        this.assetStatusFilter = filters.status || '';
        this.assetCategoryFilter = filters.category || '';
        this.filterAssets();
    }

    filterEmployees() {
        let filtered = this.employees();

        // Apply search filter
        if (this.employeeSearch.trim()) {
            const search = this.employeeSearch.toLowerCase();
            filtered = filtered.filter(
                (e) =>
                    e.name.toLowerCase().includes(search) ||
                    e.email.toLowerCase().includes(search),
            );
        }

        // Apply role filter
        if (this.employeeRoleFilter) {
            filtered = filtered.filter((e) => e.role === this.employeeRoleFilter);
        }

        this.filteredEmployees.set(filtered);
        this.employeePageIndex.set(0);
    }

    onEmployeeFilterChange(filters: { status?: string; category?: string; role?: string }) {
        this.employeeRoleFilter = filters.role || '';
        this.filterEmployees();
    }

    filterDepartments() {
        if (!this.departmentSearch.trim()) {
            this.filteredDepartments.set(this.departments());
        } else {
            const search = this.departmentSearch.toLowerCase();
            this.filteredDepartments.set(
                this.departments().filter(
                    (d) =>
                        d.name.toLowerCase().includes(search) ||
                        (d.responsibleEmployeeName && d.responsibleEmployeeName.toLowerCase().includes(search)),
                ),
            );
        }
        this.departmentPageIndex.set(0);
    }

    updateCharts() {
        const complaintsData = this.getFilteredComplaintsByStatus();
        const requestsData = this.getFilteredRequestsByStatus();

        this.createComplaintsChart(complaintsData);
        this.createRequestsChart(requestsData);
    }

    getFilteredComplaintsByStatus() {
        const filtered = this.filterByDate(this.complaints());
        const statusCounts = {
            NEW: 0,
            IN_PROGRESS: 0,
            RESOLVED: 0,
        };

        filtered.forEach((c) => {
            if (statusCounts.hasOwnProperty(c.status)) {
                statusCounts[c.status as keyof typeof statusCounts]++;
            }
        });

        return statusCounts;
    }

    getFilteredRequestsByStatus() {
        const filtered = this.filterByDate(this.requests());
        const statusCounts = {
            PENDING: 0,
            APPROVED: 0,
            REJECTED: 0,
            COMPLETED: 0,
        };

        filtered.forEach((r) => {
            if (statusCounts.hasOwnProperty(r.status)) {
                statusCounts[r.status as keyof typeof statusCounts]++;
            }
        });

        return statusCounts;
    }

    filterByDate(items: ComplaintDTO[] | RequestDTO[]) {
        const now = new Date();
        return items.filter((item) => {
            if (!item.createdAt) return false;
            const itemDate = new Date(item.createdAt);
            switch (this.dateFilter) {
                case 'today':
                    return itemDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return itemDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return itemDate >= monthAgo;
                default:
                    return true;
            }
        });
    }

    createComplaintsChart(data: Record<string, number>) {
        if (this.complaintsChart) {
            this.complaintsChart.destroy();
        }

        const ctx = this.complaintsChartRef?.nativeElement.getContext('2d');
        if (!ctx) return;

        const textColor = this.getComputedColor('--text-primary');
        const borderColor = this.getComputedColor('--border-color');

        this.complaintsChart = new ChartJS(ctx, {
            type: 'doughnut',
            data: {
                labels: ['New', 'In Progress', 'Resolved'],
                datasets: [
                    {
                        data: [data['NEW'], data['IN_PROGRESS'], data['RESOLVED']],
                        backgroundColor: ['#ff9800', '#2196f3', '#4caf50'],
                        borderColor: borderColor,
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                            font: { size: 12 },
                        },
                    },
                },
            },
        } as ChartConfiguration);
    }

    createRequestsChart(data: Record<string, number>) {
        if (this.requestsChart) {
            this.requestsChart.destroy();
        }

        const ctx = this.requestsChartRef?.nativeElement.getContext('2d');
        if (!ctx) return;

        const textColor = this.getComputedColor('--text-primary');
        const borderColor = this.getComputedColor('--border-color');

        this.requestsChart = new ChartJS(ctx, {
            type: 'bar',
            data: {
                labels: ['Pending', 'Approved', 'Rejected', 'Completed'],
                datasets: [
                    {
                        label: 'Requests',
                        data: [
                            data['PENDING'],
                            data['APPROVED'],
                            data['REJECTED'],
                            data['COMPLETED'],
                        ],
                        backgroundColor: ['#ff9800', '#4caf50', '#f44336', '#2196f3'],
                        borderColor: borderColor,
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                            font: { size: 12 },
                        },
                    },
                },
                scales: {
                    y: {
                        ticks: {
                            color: textColor,
                            stepSize: 1,
                        },
                        grid: {
                            color: borderColor,
                        },
                    },
                    x: {
                        ticks: {
                            color: textColor,
                        },
                        grid: {
                            color: borderColor,
                        },
                    },
                },
            },
        } as ChartConfiguration);
    }

    openAddAssetDialog() {
        this.dialog
            .open(AddAssetDialogComponent)
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.listCache.invalidateByPrefix('assets');
                    this.loadAssets();
                    this.snackbarService.success('Asset added successfully');
                }
            });
    }

    openAssetDetail(asset: AssetDTO) {
        this.dialog.open(AssetDetailDialogComponent, { data: asset }).afterClosed().subscribe((result) => {
            if (result?.reload) {
                this.loadAssets();
            }
        });
    }

    editAsset(asset: AssetDTO) {
        this.dialog.open(EditAssetDialogComponent, { data: asset }).afterClosed().subscribe((result) => {
            if (result) {
                this.listCache.invalidateByPrefix('assets');
                this.loadAssets();
                this.snackbarService.success('Asset updated successfully');
            }
        });
    }

    deleteAsset(id: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent);
        const instance = dialogRef.componentInstance;
        instance.title = 'Delete Asset';
        instance.message = 'Are you sure you want to delete this asset? This action cannot be undone.';
        instance.confirmLabel = 'Delete Asset';

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.apiService.delete(`assets/${id}`).subscribe({
                    next: () => {
                        this.listCache.invalidateByPrefix('assets');
                        this.snackbarService.success('Asset deleted');
                        this.loadAssets();
                    },
                    error: () => this.snackbarService.error('Failed to delete asset'),
                });
            }
        });
    }

    openAddEmployeeDialog() {
        this.dialog
            .open(AddEmployeeDialogComponent)
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.loadEmployees();
                    this.snackbarService.success('Employee added successfully');
                }
            });
    }

    editEmployee(employee: EmployeeDTO) {
        const currentUser = this.userService.currentUser();
        if (employee.id === currentUser?.id) {
            this.snackbarService.error('You cannot edit your own profile');
            return;
        }
        this.dialog.open(EditEmployeeDialogComponent, { data: employee }).afterClosed().subscribe((result) => {
            if (result) {
                this.loadEmployees();
                this.snackbarService.success('Employee updated successfully');
            }
        });
    }

    deleteEmployee(id: number) {
        const currentUser = this.userService.currentUser();
        if (id === currentUser?.id) {
            this.snackbarService.error('You cannot delete your own account');
            return;
        }
        const dialogRef = this.dialog.open(ConfirmDialogComponent);
        const instance = dialogRef.componentInstance;
        instance.title = 'Delete Employee';
        instance.message = 'Are you sure you want to delete this employee? This action cannot be undone.';
        instance.confirmLabel = 'Delete Employee';

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.apiService.delete(`employees/${id}`).subscribe({
                    next: () => {
                        this.snackbarService.success('Employee deleted');
                        this.loadEmployees();
                    },
                    error: () => this.snackbarService.error('Failed to delete employee'),
                });
            }
        });
    }

    openAddDepartmentDialog() {
        this.dialog
            .open(AddDepartmentDialogComponent)
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.loadDepartments();
                    this.snackbarService.success('Department added successfully');
                }
            });
    }

    editDepartment(department: DepartmentDTO) {
        this.dialog.open(EditDepartmentDialogComponent, { data: department }).afterClosed().subscribe((result) => {
            if (result) {
                this.loadDepartments();
                this.snackbarService.success('Department updated successfully');
            }
        });
    }

    deleteDepartment(id: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent);
        const instance = dialogRef.componentInstance;
        instance.title = 'Delete Department';
        instance.message = 'Are you sure you want to delete this department? This action cannot be undone.';
        instance.confirmLabel = 'Delete Department';

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.apiService.delete(`departments/${id}`).subscribe({
                    next: () => {
                        this.snackbarService.success('Department deleted');
                        this.loadDepartments();
                    },
                    error: () => this.snackbarService.error('Failed to delete department'),
                });
            }
        });
    }

    loadActivityLog() {
        const page = this.activityPageIndex();
        const size = this.activityPageSize();
        this.apiService
            .get<{ items: any[]; total: number }>(
                `assignment-tasks?page=${page}&size=${size}&sortBy=acceptedAt&sortOrder=DESC`
            )
            .subscribe({
                next: (response: ApiResponse<{ items: any[]; total: number }>) => {
                    const items = (response.data?.items ?? []).sort((a, b) => b.id - a.id);
                    this.activityLog.set(items);
                    this.activityTotal.set(response.data?.total ?? 0);
                },
                error: () => this.snackbarService.error('Failed to load activity log'),
            });
    }

    filterActivityLog() {
        const log = this.activityLog();
        if (!this.activitySearch.trim()) {
            this.activityLog.set(log);
        } else {
            const search = this.activitySearch.toLowerCase();
            this.activityLog.set(
                log.filter(
                    (entry) =>
                        (entry.itemTitle && entry.itemTitle.toLowerCase().includes(search)) ||
                        (entry.acceptedByName && entry.acceptedByName.toLowerCase().includes(search)) ||
                        entry.itemType.toLowerCase().includes(search)
                )
            );
        }
        this.activityPageIndex.set(0);
    }

    onActivityPageChange(event: PageEvent) {
        this.activityPageIndex.set(event.pageIndex);
        this.activityPageSize.set(event.pageSize);
        this.loadActivityLog();
    }

    onAssetPageChange(event: PageEvent) {
        this.assetPageIndex.set(event.pageIndex);
        this.assetPageSize.set(event.pageSize);
        this.loadAssets();
    }

    onEmployeePageChange(event: PageEvent) {
        this.employeePageIndex.set(event.pageIndex);
        this.employeePageSize.set(event.pageSize);
        this.loadEmployees();
    }

    onDepartmentPageChange(event: PageEvent) {
        this.departmentPageIndex.set(event.pageIndex);
        this.departmentPageSize.set(event.pageSize);
        this.loadDepartments();
    }

    openExportDialog(tableType: 'assets' | 'employees' | 'departments' | 'complaints' | 'requests' | 'activity'): void {
        this.dialog
            .open(ExportDialogComponent)
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.downloadReport(tableType, result.format, result.scope);
                }
            });
    }

    downloadReport(
        tableType: string,
        format: 'pdf' | 'csv',
        scope: 'with-filters' | 'all'
    ): void {
        const endpoints: { [key: string]: { pdf: string; csv: string } } = {
            assets: { pdf: 'reports/assets', csv: 'reports/assets/csv' },
            employees: { pdf: 'reports/employees', csv: 'reports/employees/csv' },
            departments: { pdf: 'reports/departments', csv: 'reports/departments/csv' },
            complaints: { pdf: 'reports/complaints', csv: 'reports/complaints/csv' },
            requests: { pdf: 'reports/requests', csv: 'reports/requests/csv' },
            activity: { pdf: 'reports/activity', csv: 'reports/activity/csv' },
        };

        const endpoint = endpoints[tableType]?.[format];
        if (!endpoint) {
            this.snackbarService.error('Invalid export configuration');
            return;
        }

        const filename = `${tableType}_report.${format}`;
        const params: Record<string, any> = {};

        if (scope === 'all') {
            params['exportAll'] = true;
        } else if (scope === 'with-filters') {
            // Include relevant filters based on table type
            switch (tableType) {
                case 'assets':
                    if (this.assetStatusFilter) params['status'] = this.assetStatusFilter;
                    if (this.assetCategoryFilter) params['category'] = this.assetCategoryFilter;
                    if (this.assetSearch) params['search'] = this.assetSearch;
                    break;
                case 'employees':
                    if (this.employeeRoleFilter) params['role'] = this.employeeRoleFilter;
                    if (this.employeeSearch) params['search'] = this.employeeSearch;
                    break;
                case 'complaints':
                    if (this.assetSearch) params['search'] = this.assetSearch;
                    break;
                case 'requests':
                    if (this.assetSearch) params['search'] = this.assetSearch;
                    break;
            }
        }

        this.apiService.getBlob(endpoint, params).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
                window.URL.revokeObjectURL(url);
                this.snackbarService.success(`${tableType} exported successfully`);
            },
            error: () => this.snackbarService.error(`Failed to export ${tableType}`),
        });
    }

    private getComputedColor(varName: string): string {
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }

    private getDepartmentFilter(): string | null {
        const user = this.userService.currentUser();
        if (user?.role === 'DEPT_RESPONSIBLE' && user?.department) {
            return user.department;
        }
        return null;
    }

    private filterByDepartment(items: any[]): any[] {
        const deptFilter = this.getDepartmentFilter();
        if (!deptFilter) {
            return items;
        }

        return items.filter((item: any) => {
            const itemDept = item.departmentName || item.department;
            return itemDept === deptFilter;
        });
    }
}
