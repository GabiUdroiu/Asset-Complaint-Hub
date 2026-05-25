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
import { AddAssetDialogComponent } from '../dialogs/add-asset-dialog.component';
import { AddEmployeeDialogComponent } from '../dialogs/add-employee-dialog.component';
import { AddDepartmentDialogComponent } from '../dialogs/add-department-dialog.component';
import { EditAssetDialogComponent } from '../dialogs/edit-asset-dialog.component';
import { EditEmployeeDialogComponent } from '../dialogs/edit-employee-dialog.component';
import { EditDepartmentDialogComponent } from '../dialogs/edit-department-dialog.component';
import { AssetDetailDialogComponent } from '../../assets/asset-detail-dialog/asset-detail-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ExportDialogComponent } from '../../../shared/components/export-dialog/export-dialog.component';
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

interface AssetDTO {
    id: number;
    name: string;
    serialNumber: string;
    category: string;
    status: string;
    employeeId: number;
}

interface EmployeeDTO {
    id: number;
    name: string;
    email: string;
    role: string;
    departmentId: number;
}

interface ComplaintDTO {
    id: number;
    title: string;
    status: string;
    assetId: number;
    employeeId: number;
    createdAt: string;
}

interface RequestDTO {
    id: number;
    title: string;
    status: string;
    createdAt: string;
}

interface DepartmentDTO {
    id: number;
    name: string;
    responsibleEmployeeId?: number;
    responsibleEmployeeName?: string;
}


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
    ],
    template: `
        <section class="page-shell">
            <header class="page-header">
                <div class="header-top">
                    <button mat-icon-button routerLink="/home" matTooltip="Back to home">
                        <mat-icon>arrow_back</mat-icon>
                    </button>
                    <div>
                        <h2 class="text-2xl font-medium">Admin Dashboard</h2>
                        <p class="subtitle text-gray-600">System overview and management</p>
                    </div>
                </div>
            </header>

            <mat-tab-group>
                <!-- Stats Tab -->
                <mat-tab>
                    <ng-template mat-tab-label>
                        <mat-icon>dashboard</mat-icon>
                        Overview
                    </ng-template>

                    <!-- <section class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon" style="background-color: #2196f3;">
                                <mat-icon>inventory_2</mat-icon>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ assets().length }}</div>
                                <div class="stat-label">Total Assets</div>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-icon" style="background-color: #4caf50;">
                                <mat-icon>people</mat-icon>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ employees().length }}</div>
                                <div class="stat-label">Employees</div>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-icon" style="background-color: #ff9800;">
                                <mat-icon>warning</mat-icon>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ complaints().length }}</div>
                                <div class="stat-label">Complaints</div>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-icon" style="background-color: #f44336;">
                                <mat-icon>assignment</mat-icon>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ requests().length }}</div>
                                <div class="stat-label">Requests</div>
                            </div>
                        </div>
                    </section> -->

                    <!-- Charts Section -->
                    <section class="charts-section mt-8">
                        <div class="charts-grid">
                            <mat-card class="chart-card">
                                <mat-card-header>
                                    <mat-card-title>Complaints by Status</mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <canvas #complaintsChart></canvas>
                                </mat-card-content>
                            </mat-card>

                            <mat-card class="chart-card">
                                <mat-card-header>
                                    <mat-card-title>Requests by Status</mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <canvas #requestsChart></canvas>
                                </mat-card-content>
                            </mat-card>
                        </div>
                    </section>
                    <div class="chart-filter">
                        <label class="text-gray-600! font-normal!">Filter by date:</label>
                        <select
                            [(ngModel)]="dateFilter"
                            (ngModelChange)="updateCharts()"
                            class="filter-select"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                        </select>
                    </div>
                </mat-tab>
                <!-- Assets Tab -->
                <mat-tab>
                    <ng-template mat-tab-label>
                        <mat-icon>inventory_2</mat-icon>
                        Assets
                    </ng-template>

                    <div class="tab-content">
                        <div class="toolbar">
                            <div class="toolbar-left">
                                <button mat-raised-button color="accent" (click)="openAddAssetDialog()">
                                    <mat-icon>add</mat-icon>
                                    Add Asset
                                </button>
                                <input
                                    type="text"
                                    placeholder="Search assets..."
                                    [(ngModel)]="assetSearch"
                                    (ngModelChange)="filterAssets()"
                                />
                            </div>
                            <button mat-raised-button (click)="openExportDialog('assets')">
                                <mat-icon>download</mat-icon>
                                Export
                            </button>
                        </div>

                        <table mat-table [dataSource]="filteredAssets()" class="assets-table">
                            <ng-container matColumnDef="id">
                                <th mat-header-cell *matHeaderCellDef>ID</th>
                                <td mat-cell *matCellDef="let element">{{ element.id }}</td>
                            </ng-container>

                            <ng-container matColumnDef="name">
                                <th mat-header-cell *matHeaderCellDef>Name</th>
                                <td mat-cell *matCellDef="let element">{{ element.name }}</td>
                            </ng-container>

                            <ng-container matColumnDef="category">
                                <th mat-header-cell *matHeaderCellDef>Category</th>
                                <td mat-cell *matCellDef="let element">{{ element.category }}</td>
                            </ng-container>

                            <ng-container matColumnDef="status">
                                <th mat-header-cell *matHeaderCellDef>Status</th>
                                <td mat-cell *matCellDef="let element">
                                    <span [ngClass]="['status-dot', element.status.toLowerCase()]">
                                        <span class="dot"></span>
                                        <span>{{ element.status }}</span>
                                    </span>
                                </td>
                            </ng-container>

                            <ng-container matColumnDef="actions">
                                <th mat-header-cell *matHeaderCellDef>Actions</th>
                                <td mat-cell *matCellDef="let element">
                                    <button
                                        mat-icon-button
                                        (click)="openAssetDetail(element)"
                                        title="View Details"
                                    >
                                        <mat-icon>open_in_new</mat-icon>
                                    </button>
                                    <button
                                        mat-icon-button
                                        (click)="editAsset(element)"
                                        title="Edit"
                                    >
                                        <mat-icon>edit</mat-icon>
                                    </button>
                                    <button
                                        mat-icon-button
                                        color="warn"
                                        (click)="deleteAsset(element.id)"
                                        title="Delete"
                                    >
                                        <mat-icon>delete</mat-icon>
                                    </button>
                                </td>
                            </ng-container>

                            <tr mat-header-row *matHeaderRowDef="assetColumns"></tr>
                            <tr mat-row *matRowDef="let row; columns: assetColumns"></tr>
                        </table>
                        <mat-paginator
                            [length]="assetTotal()"
                            [pageSize]="assetPageSize()"
                            [pageSizeOptions]="[5, 10, 25, 50]"
                            (page)="onAssetPageChange($event)"
                        >
                        </mat-paginator>
                    </div>
                </mat-tab>

                <!-- Employees Tab -->
                <mat-tab>
                    <ng-template mat-tab-label>
                        <mat-icon>people</mat-icon>
                        Employees
                    </ng-template>

                    <div class="tab-content">
                        <div class="toolbar">
                            <div class="toolbar-left">
                                <button mat-raised-button color="accent" (click)="openAddEmployeeDialog()">
                                    <mat-icon>add</mat-icon>
                                    Add Employee
                                </button>
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    [(ngModel)]="employeeSearch"
                                    (ngModelChange)="filterEmployees()"
                                />
                            </div>
                            <button mat-raised-button (click)="openExportDialog('employees')">
                                <mat-icon>download</mat-icon>
                                Export
                            </button>
                        </div>

                        <table mat-table [dataSource]="filteredEmployees()" class="employees-table">
                            <ng-container matColumnDef="id">
                                <th mat-header-cell *matHeaderCellDef>ID</th>
                                <td mat-cell *matCellDef="let element">{{ element.id }}</td>
                            </ng-container>

                            <ng-container matColumnDef="name">
                                <th mat-header-cell *matHeaderCellDef>Name</th>
                                <td mat-cell *matCellDef="let element">{{ element.name }}</td>
                            </ng-container>

                            <ng-container matColumnDef="email">
                                <th mat-header-cell *matHeaderCellDef>Email</th>
                                <td mat-cell *matCellDef="let element">{{ element.email }}</td>
                            </ng-container>

                            <ng-container matColumnDef="role">
                                <th mat-header-cell *matHeaderCellDef>Role</th>
                                <td mat-cell *matCellDef="let element">
                                    <span [ngClass]="['status-dot', 'role-' + element.role.toLowerCase()]">
                                        <span class="dot"></span>
                                        <span>{{ element.role | titlecase }}</span>
                                    </span>
                                </td>
                            </ng-container>

                            <ng-container matColumnDef="actions">
                                <th mat-header-cell *matHeaderCellDef>Actions</th>
                                <td mat-cell *matCellDef="let element">
                                    <button
                                        mat-icon-button
                                        (click)="editEmployee(element)"
                                        title="Edit"
                                    >
                                        <mat-icon>edit</mat-icon>
                                    </button>
                                    <button
                                        mat-icon-button
                                        color="warn"
                                        (click)="deleteEmployee(element.id)"
                                        title="Delete"
                                    >
                                        <mat-icon>delete</mat-icon>
                                    </button>
                                </td>
                            </ng-container>

                            <tr mat-header-row *matHeaderRowDef="employeeColumns"></tr>
                            <tr mat-row *matRowDef="let row; columns: employeeColumns"></tr>
                        </table>
                        <mat-paginator
                            [length]="employeeTotal()"
                            [pageSize]="employeePageSize()"
                            [pageSizeOptions]="[5, 10, 25, 50]"
                            (page)="onEmployeePageChange($event)"
                        >
                        </mat-paginator>
                    </div>
                </mat-tab>

                <!-- Departments Tab -->
                <mat-tab>
                    <ng-template mat-tab-label>
                        <mat-icon>domain</mat-icon>
                        Departments
                    </ng-template>

                    <div class="tab-content">
                        <div class="toolbar">
                            <div class="toolbar-left">
                                <button mat-raised-button color="accent" (click)="openAddDepartmentDialog()">
                                    <mat-icon>add</mat-icon>
                                    Add Department
                                </button>
                                <input
                                    type="text"
                                    placeholder="Search departments..."
                                    [(ngModel)]="departmentSearch"
                                    (ngModelChange)="filterDepartments()"
                                />
                            </div>
                            <button mat-raised-button (click)="openExportDialog('departments')">
                                <mat-icon>download</mat-icon>
                                Export
                            </button>
                        </div>

                        <table mat-table [dataSource]="filteredDepartments()" class="departments-table">
                            <ng-container matColumnDef="id">
                                <th mat-header-cell *matHeaderCellDef>ID</th>
                                <td mat-cell *matCellDef="let element">{{ element.id }}</td>
                            </ng-container>

                            <ng-container matColumnDef="name">
                                <th mat-header-cell *matHeaderCellDef>Name</th>
                                <td mat-cell *matCellDef="let element">{{ element.name }}</td>
                            </ng-container>

                            <ng-container matColumnDef="responsibleEmployee">
                                <th mat-header-cell *matHeaderCellDef>Responsible Employee</th>
                                <td mat-cell *matCellDef="let element">
                                    {{ element.responsibleEmployeeName || '-' }}
                                </td>
                            </ng-container>

                            <ng-container matColumnDef="actions">
                                <th mat-header-cell *matHeaderCellDef>Actions</th>
                                <td mat-cell *matCellDef="let element">
                                    <button
                                        mat-icon-button
                                        (click)="editDepartment(element)"
                                        title="Edit"
                                    >
                                        <mat-icon>edit</mat-icon>
                                    </button>
                                    <button
                                        mat-icon-button
                                        color="warn"
                                        (click)="deleteDepartment(element.id)"
                                        title="Delete"
                                    >
                                        <mat-icon>delete</mat-icon>
                                    </button>
                                </td>
                            </ng-container>

                            <tr mat-header-row *matHeaderRowDef="departmentColumns"></tr>
                            <tr mat-row *matRowDef="let row; columns: departmentColumns"></tr>
                        </table>
                        <mat-paginator
                            [length]="departmentTotal()"
                            [pageSize]="departmentPageSize()"
                            [pageSizeOptions]="[5, 10, 25, 50]"
                            (page)="onDepartmentPageChange($event)"
                        >
                        </mat-paginator>
                    </div>
                </mat-tab>

                <!-- Activity Log Tab -->
                <mat-tab>
                    <ng-template mat-tab-label>
                        <mat-icon>history</mat-icon>
                        Activity Log
                    </ng-template>

                    <div class="tab-content">
                        <div class="toolbar">
                            <div class="toolbar-left">
                                <button mat-icon-button (click)="loadActivityLog()" matTooltip="Refresh">
                                    <mat-icon>refresh</mat-icon>
                                </button>
                            </div>
                            <button mat-raised-button (click)="openExportDialog('activity')">
                                <mat-icon>download</mat-icon>
                                Export
                            </button>
                        </div>

                        @if (activityLog().length > 0) {
                            <table mat-table [dataSource]="activityLog()" class="assets-table">
                                <ng-container matColumnDef="type">
                                    <th mat-header-cell *matHeaderCellDef>Type</th>
                                    <td mat-cell *matCellDef="let entry">
                                        <span class="item-type-chip" [ngClass]="entry.itemType.toLowerCase()">
                                            <mat-icon>{{ entry.itemType === 'COMPLAINT' ? 'warning' : 'pending_actions' }}</mat-icon>
                                            {{ entry.itemType | titlecase }}
                                        </span>
                                    </td>
                                </ng-container>

                                <ng-container matColumnDef="item">
                                    <th mat-header-cell *matHeaderCellDef>Item</th>
                                    <td mat-cell *matCellDef="let entry">
                                        <span class="font-medium">{{ entry.itemTitle || (entry.itemType + ' #' + entry.itemId) }}</span>
                                    </td>
                                </ng-container>

                                <ng-container matColumnDef="acceptedBy">
                                    <th mat-header-cell *matHeaderCellDef>Accepted by</th>
                                    <td mat-cell *matCellDef="let entry">
                                        {{ entry.acceptedByName || ('Employee #' + entry.acceptedBy) }}
                                    </td>
                                </ng-container>

                                <ng-container matColumnDef="status">
                                    <th mat-header-cell *matHeaderCellDef>Status</th>
                                    <td mat-cell *matCellDef="let entry">
                                        <span [ngClass]="['status-dot', entry.status.toLowerCase()]">
                                            <span class="dot"></span>
                                            <span>{{ entry.status }}</span>
                                        </span>
                                    </td>
                                </ng-container>

                                <ng-container matColumnDef="date">
                                    <th mat-header-cell *matHeaderCellDef>Accepted at</th>
                                    <td mat-cell *matCellDef="let entry" class="date-cell">
                                        {{ entry.acceptedAt | date: 'dd MMM yyyy, HH:mm' }}
                                    </td>
                                </ng-container>

                                <tr mat-header-row *matHeaderRowDef="activityColumns"></tr>
                                <tr mat-row *matRowDef="let row; columns: activityColumns"></tr>
                            </table>
                            <mat-paginator
                                [length]="activityTotal()"
                                [pageSize]="activityPageSize()"
                                [pageSizeOptions]="[10, 25, 50]"
                                (page)="onActivityPageChange($event)"
                            ></mat-paginator>
                        } @else {
                            <div class="empty-log">
                                <mat-icon>history_toggle_off</mat-icon>
                                <p>No activity recorded yet</p>
                            </div>
                        }
                    </div>
                </mat-tab>

            </mat-tab-group>
        </section>
    `,
    styles: [
        `
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            }

            .stat-card {
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                box-shadow: var(--shadow-sm);
            }

            .stat-icon {
                width: 50px;
                height: 50px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }

            .stat-content {
                display: flex;
                flex-direction: column;
            }

            .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: var(--text-primary);
            }

            .stat-label {
                font-size: 12px;
                color: var(--text-secondary);
                margin-top: 5px;
            }

            .charts-section {
                margin-bottom: 40px;
            }

            .chart-filter {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
            }

            .chart-filter label {
                font-weight: 600;
                color: var(--text-primary);
            }

            .filter-select {
                padding: 8px 12px;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                background-color: var(--bg-primary);
                color: var(--text-primary);
                font-size: 14px;
                cursor: pointer;
            }

            .charts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 20px;
            }

            .chart-card {
                background: var(--bg-primary);
                color: var(--text-primary);
                padding: 20px;
                border-radius: 8px;
                box-shadow: var(--shadow-sm);
            }

            .chart-card mat-card-header {
                margin-bottom: 20px;
            }

            .chart-card canvas {
                max-height: 300px;
            }

            .tab-content {
                padding: 20px 0;
            }

            .toolbar {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                align-items: center;
                justify-content: space-between;
            }

            .toolbar-left {
                display: flex;
                gap: 10px;
                align-items: center;
                flex: 1;
            }

            .toolbar input {
                flex: 1;
                max-width: 300px;
                padding: 8px 12px;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                font-size: 14px;
                background-color: var(--bg-primary);
                color: var(--text-primary);
            }

            .toolbar button[mat-icon-button] {
                flex-shrink: 0;
            }

            table {
                width: 100%;
                border-collapse: collapse;
            }

            th {
                background-color: var(--bg-secondary);
                color: var(--text-primary);
                padding: 12px;
                text-align: left;
                font-weight: 600;
                border-bottom: 2px solid var(--border-color);
            }

            td {
                padding: 12px;
                border-bottom: 1px solid var(--border-color);
                color: var(--text-primary);
            }

            tr:hover {
                background-color: var(--bg-secondary);
            }


            button {
                cursor: pointer;
            }

            .badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 12px;
                background-color: var(--color-info);
                color: white;
                font-size: 12px;
                font-weight: 500;
            }

            ::ng-deep .status-dot {
                display: inline-flex !important;
                align-items: center !important;
                gap: 6px !important;
                font-size: 14px !important;
                color: var(--text-primary) !important;
            }

            ::ng-deep .status-dot .dot {
                width: 8px !important;
                height: 8px !important;
                border-radius: 50% !important;
                flex-shrink: 0 !important;
            }

            ::ng-deep .status-dot.active .dot {
                background-color: #4caf50 !important;
            }

            ::ng-deep .status-dot.inactive .dot {
                background-color: #757575 !important;
            }

            ::ng-deep .status-dot.maintenance .dot {
                background-color: #ff9800 !important;
            }

            ::ng-deep .status-dot.pending .dot {
                background-color: #ff9800 !important;
            }

            ::ng-deep .status-dot.approved .dot {
                background-color: #4caf50 !important;
            }

            ::ng-deep .status-dot.rejected .dot {
                background-color: #f44336 !important;
            }

            ::ng-deep .status-dot.completed .dot {
                background-color: #4caf50 !important;
            }

            ::ng-deep .status-dot.role-user .dot {
                background-color: #4caf50 !important;
            }

            ::ng-deep .status-dot.role-dept_responsible .dot {
                background-color: #2196f3 !important;
            }

            ::ng-deep .status-dot.role-admin .dot {
                background-color: #f44336 !important;
            }

            .item-type-chip {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;

                mat-icon {
                    font-size: 14px;
                    width: 14px;
                    height: 14px;
                    line-height: 14px;
                }

                &.complaint {
                    background: rgba(244, 67, 54, 0.1);
                    color: #f44336;
                }

                &.request {
                    background: rgba(33, 150, 243, 0.1);
                    color: #2196f3;
                }
            }

            .date-cell {
                font-size: 13px;
                color: var(--text-secondary);
            }

            .empty-log {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                padding: 48px 0;
                color: var(--text-secondary);

                mat-icon {
                    font-size: 2.5rem;
                    width: 2.5rem;
                    height: 2.5rem;
                    opacity: 0.4;
                }

                p { margin: 0; font-size: 0.9rem; }
            }

            ::ng-deep mat-paginator {
                background: transparent !important;
                border: none !important;
                color: var(--text-primary) !important;
            }

            ::ng-deep .mat-mdc-paginator {
                background: transparent !important;
            }

            ::ng-deep .mdc-paginator__container {
                background: transparent !important;
            }
        `,
    ],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
    private apiService = inject(ApiService);
    private snackbarService = inject(SnackbarService);
    private dialog = inject(MatDialog);
    private userService = inject(UserService);

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
    dateFilter = 'all';

    assetColumns = ['id', 'name', 'category', 'status', 'actions'];
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
            .get<{ items: AssetDTO[]; total: number }>(`assets?page=${page}&size=${size}`)
            .subscribe({
                next: (response: ApiResponse<{ items: AssetDTO[]; total: number }>) => {
                    let items = response.data?.items ?? [];
                    items = this.filterByDepartment(items);
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
                    let items = response.data?.items ?? [];
                    items = this.filterByDepartment(items);
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
                    this.departments.set(response.data?.items ?? []);
                    this.filteredDepartments.set(response.data?.items ?? []);
                    this.departmentTotal.set(response.data?.total ?? 0);
                },
                error: () => this.snackbarService.error('Failed to load departments'),
            });
    }

    loadComplaints() {
        this.apiService.get<{ items: ComplaintDTO[] }>('complaints?page=0&size=100').subscribe({
            next: (response: ApiResponse<{ items: ComplaintDTO[] }>) => {
                let items = response.data?.items ?? [];
                items = this.filterByDepartment(items);
                this.complaints.set(items);
            },
            error: () => this.snackbarService.error('Failed to load complaints'),
        });
    }

    loadRequests() {
        this.apiService.get<{ items: RequestDTO[] }>('requests?page=0&size=100').subscribe({
            next: (response: ApiResponse<{ items: RequestDTO[] }>) => {
                let items = response.data?.items ?? [];
                items = this.filterByDepartment(items);
                this.requests.set(items);
            },
            error: () => this.snackbarService.error('Failed to load requests'),
        });
    }


    filterAssets() {
        if (!this.assetSearch.trim()) {
            this.filteredAssets.set(this.assets());
        } else {
            const search = this.assetSearch.toLowerCase();
            this.filteredAssets.set(
                this.assets().filter(
                    (a) =>
                        a.name.toLowerCase().includes(search) ||
                        a.serialNumber.toLowerCase().includes(search) ||
                        a.category.toLowerCase().includes(search),
                ),
            );
        }
        this.assetPageIndex.set(0);
    }

    filterEmployees() {
        if (!this.employeeSearch.trim()) {
            this.filteredEmployees.set(this.employees());
        } else {
            const search = this.employeeSearch.toLowerCase();
            this.filteredEmployees.set(
                this.employees().filter(
                    (e) =>
                        e.name.toLowerCase().includes(search) ||
                        e.email.toLowerCase().includes(search),
                ),
            );
        }
        this.employeePageIndex.set(0);
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
        this.dialog.open(EditEmployeeDialogComponent, { data: employee }).afterClosed().subscribe((result) => {
            if (result) {
                this.loadEmployees();
                this.snackbarService.success('Employee updated successfully');
            }
        });
    }

    deleteEmployee(id: number) {
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
                    this.activityLog.set(response.data?.items ?? []);
                    this.activityTotal.set(response.data?.total ?? 0);
                },
                error: () => this.snackbarService.error('Failed to load activity log'),
            });
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
        const params = scope === 'all' ? { exportAll: true } : {};

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
