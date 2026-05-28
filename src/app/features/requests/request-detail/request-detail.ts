import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService, ApiResponse } from '../../../shared/services/api.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { RecentItemsService } from '../../../shared/services/recent-items.service';
import { ListCacheService } from '../../../shared/services/list-cache.service';
import { UserService } from '../../../core/services/user.service';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { RequestDTO, EmployeeDTO } from '../../../shared/models';

@Component({
    selector: 'request-detail',
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        FormatDatePipe,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
    ],
    template: `
        <section class="page-shell">
            <!-- @if (isLocked()) {
                <div class="lock-banner">
                    <mat-icon>lock</mat-icon>
                    <span>This request is being edited by <strong>{{ lockedByName() }}</strong></span>
                </div>
            } -->
            <header class="page-header">
                <div class="header-top">
                    <button mat-icon-button routerLink="/requests" matTooltip="Back to requests">
                        <mat-icon>arrow_back</mat-icon>
                    </button>
                    <div>
                        <h2 class="text-2xl font-medium">
                            <a routerLink="/requests">Requests</a>
                            <span class="text-gray-400"
                                ><mat-icon class="align-middle text-[18px]! w-auto! h-auto!"
                                    >chevron_right</mat-icon
                                ></span
                            >
                            #{{ request()?.id }} - {{ request()?.title }}
                        </h2>
                        <p class="subtitle">Request details and approval tracking</p>
                    </div>
                    @if (userService.isResponsible() && userService.isInSupportMode()) {
                        <div class="actions">
                            @if (!accepted()) {
                                <button matButton="filled" color="accent" (click)="acceptRequest()">
                                    Accept
                                </button>
                            }
                            @if (accepted() && (!isLocked() || lockedById() === userService.currentUser()?.id)) {
                                <select
                                    [ngModel]="selectedStatus()"
                                    (ngModelChange)="selectedStatus.set($event)"
                                    class="status-select"
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="APPROVED">APPROVED</option>
                                    <option value="REJECTED">REJECTED</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                </select>
                                <button matButton="filled" color="primary" (click)="updateStatus()">
                                    Update Status
                                </button>
                            }
                        </div>
                    }
                </div>
            </header>

            @if (request()) {
            <div class="content">
                <mat-card>
                    <mat-card-header>
                        <mat-card-title>Request Details</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Status</label>
                                <mat-chip-set>
                                    <mat-chip
                                        [class]="
                                            'status-' + (request()?.status?.toLowerCase() || '')
                                        "
                                    >
                                        {{ request()?.status }}
                                    </mat-chip>
                                </mat-chip-set>
                            </div>
                            <div class="detail-item">
                                <label>Requested By</label>
                                <p>{{ request()?.employeeName || 'N/A' }}</p>
                            </div>
                            <div class="detail-item">
                                <label>Department</label>
                                <p>{{ request()?.departmentName || 'N/A' }}</p>
                            </div>
                            <div class="detail-item">
                                <label>Related Asset</label>
                                <p>
                                    {{
                                        request()?.assetId ? 'Asset #' + request()!.assetId : 'None'
                                    }}
                                </p>
                            </div>
                            <div class="detail-item">
                                <label>Created</label>
                                <p>{{ request()?.createdAt | formatDate }}</p>
                            </div>
                            <div class="detail-item">
                                <label>Updated</label>
                                <p>{{ request()?.updatedAt | formatDate }}</p>
                            </div>
                            @if (request()?.acceptedByName) {
                                <div class="detail-item">
                                    <label>Accepted By</label>
                                    <p>{{ request()?.acceptedByName }}</p>
                                </div>
                                <div class="detail-item">
                                    <label>Accepted At</label>
                                    <p>{{ request()?.acceptedAt | formatDate }}</p>
                                </div>
                            }
                        </div>
                        <div class="description">
                            <label>Description</label>
                            <p>{{ request()?.description }}</p>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>
            }
        </section>
    `,
    styles: [
        `
            :host ::ng-deep .page-header .header-top {
                display: flex;
                align-items: center;
                gap: 16px;
                position: relative;
            }

            :host ::ng-deep .page-header .header-top > div:nth-child(2) {
                flex: 1;
            }

            :host ::ng-deep .page-header .header-top .actions {
                display: flex;
                gap: 10px;
                align-items: center;
                margin: 0;
                padding: 0;
                border: none;
                position: absolute;
                right: 0;
                flex-shrink: 0;
            }

            :host ::ng-deep .page-header .header-top .actions select,
            :host ::ng-deep .page-header .header-top .actions button {
                flex-shrink: 0;
            }

            .content {
                display: grid;
                grid-template-columns: 1fr;
                gap: 20px;
            }

            mat-card {
                margin-bottom: 20px;
                background-color: var(--bg-secondary);
                color: var(--text-primary);
                border-radius: 8px;
            }

            .detail-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }

            .detail-item {
                display: flex;
                flex-direction: column;
            }

            .detail-item label {
                margin-bottom: 5px;
                color: var(--text-secondary);
            }

            .detail-item p {
                margin: 0;
                color: var(--text-primary);
            }

            .description {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid var(--border-color);
            }

            .description label {
                display: block;
                margin-bottom: 10px;
                color: var(--text-secondary);
            }

            .description p {
                color: var(--text-primary);
                line-height: 1.6;
            }

            .status-select {
                padding: 8px 12px;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                font-size: 14px;
                background-color: var(--bg-primary);
                color: var(--text-primary);
            }

            :host ::ng-deep .page-header .header-top .actions .lock-status {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background-color: rgba(244, 67, 54, 0.1);
                color: #f44336;
                border-radius: 4px;
                font-weight: 500;
            }

            :host ::ng-deep .page-header .header-top .actions .lock-icon {
                font-size: 20px;
                width: 20px;
                height: 20px;
            }

            .lock-banner {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 20px;
                background-color: rgba(244, 67, 54, 0.1);
                border-left: 4px solid #f44336;
                color: #d32f2f;
                font-weight: 500;
                margin-bottom: 20px;
            }

            .lock-banner mat-icon {
                font-size: 20px;
                width: 20px;
                height: 20px;
            }

        `,
    ],
})
export class RequestDetailComponent implements OnInit, OnDestroy {
    private apiService = inject(ApiService);
    private snackbarService = inject(SnackbarService);
    private route = inject(ActivatedRoute);
    private recentItemsService = inject(RecentItemsService);
    private listCache = inject(ListCacheService);
    userService = inject(UserService);

    request = signal<RequestDTO | null>(null);
    employees = signal<Map<number, EmployeeDTO>>(new Map());
    selectedStatus = signal('');
    accepted = signal(false);
    isLoading = signal(false);
    isLocked = signal(false);
    lockedByName = signal<string | null>(null);
    lockedById = signal<number | null>(null);
    currentRequestId: number | null = null;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.currentRequestId = Number(id);
            this.loadRequest(Number(id));
            this.loadEmployees();
            this.checkIfAccepted(Number(id));
        }
    }

    ngOnDestroy() {
        if (this.currentRequestId) {
            this.releaseLock(this.currentRequestId);
        }
    }

    loadRequest(id: number) {
        this.apiService.get<RequestDTO>(`requests/${id}`).subscribe({
            next: (response: ApiResponse<RequestDTO>) => {
                this.request.set(response.data);
                if (response.data) {
                    this.selectedStatus.set(response.data.status);
                    this.recentItemsService.addItem({
                        id: response.data.id,
                        type: 'request',
                        title: response.data.title,
                        employeeId: response.data.employeeId,
                    });
                }
            },
            error: () => this.snackbarService.error('Failed to load request'),
        });
    }

    loadEmployees() {
        this.apiService.get<{ items: EmployeeDTO[] }>('employees?page=0&size=100').subscribe({
            next: (response: ApiResponse<{ items: EmployeeDTO[] }>) => {
                const empMap = new Map<number, EmployeeDTO>();
                response.data.items.forEach((emp: EmployeeDTO) => empMap.set(emp.id, emp));
                this.employees.set(empMap);
            },
            error: () => console.log('Failed to load employees'),
        });
    }

    updateStatus() {
        const currentRequest = this.request();
        if (!currentRequest) return;

        const updated = {
            ...currentRequest,
            status: this.selectedStatus(),
            version: currentRequest.version || 0,
        };
        this.apiService.put<RequestDTO>(`requests/${currentRequest.id}`, updated).subscribe({
            next: () => {
                this.listCache.invalidateByPrefix('requests');
                this.snackbarService.success('Status updated');
                this.loadRequest(currentRequest.id);
            },
            error: (error) => {
                if (error.status === 409) {
                    this.snackbarService.error('Version conflict: another user has updated this item');
                    this.loadRequest(currentRequest.id);
                } else if (error.status === 403) {
                    this.snackbarService.error('You do not have permission to update this request');
                } else {
                    this.snackbarService.error('Failed to update status');
                }
            },
        });
    }

    getEmployeeName(employeeId: number | undefined): string {
        if (!employeeId) return 'Unknown';
        return this.employees().get(employeeId)?.name || `Employee #${employeeId}`;
    }

    acceptRequest() {
        const currentRequest = this.request();
        if (!currentRequest) return;

        const currentUser = this.userService.currentUser();
        if (!currentUser) return;

        this.isLoading.set(true);
        const taskPayload = {
            itemType: 'REQUEST',
            itemId: currentRequest.id,
            acceptedBy: currentUser.id,
        };

        this.apiService.post('assignment-tasks', taskPayload).subscribe({
            next: () => {
                this.listCache.invalidateByPrefix('requests');
                this.accepted.set(true);
                this.isLoading.set(false);
                this.snackbarService.success('Request accepted');
                if (this.currentRequestId) {
                    this.acquireLock(this.currentRequestId);
                }
            },
            error: () => {
                this.isLoading.set(false);
                this.snackbarService.error('Failed to accept request');
            },
        });
    }

    private checkIfAccepted(requestId: number) {
        this.apiService.get<any>(`assignment-tasks/item/REQUEST/${requestId}`).subscribe({
            next: (response: any) => {
                this.accepted.set(response != null);
            },
            error: () => {
                this.accepted.set(false);
            },
        });
    }

    private acquireLock(requestId: number) {
        this.apiService.post<RequestDTO>(`requests/${requestId}/lock`, {}).subscribe({
            next: (response) => {
                if (response.data?.lockedByName) {
                    this.isLocked.set(true);
                    this.lockedByName.set(response.data.lockedByName);
                    this.lockedById.set(response.data.lockedById || null);
                }
            },
            error: (err) => {
                if (err.status === 409) {
                    const errorMsg = err.error?.message || 'Item is locked';
                    this.isLocked.set(true);
                    this.lockedByName.set(errorMsg.replace('Item is locked by: ', ''));
                    this.snackbarService.error(errorMsg);
                } else if (err.status !== 403) {
                    this.snackbarService.error('Failed to acquire lock');
                }
            },
        });
    }

    private releaseLock(requestId: number) {
        this.apiService.delete(`requests/${requestId}/lock`).subscribe({
            error: () => {},
        });
    }
}
