import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
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
import { UserService } from '../../../core/services/user.service';

interface RequestDTO {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    assetId: number | null;
    employeeId: number;
    createdAt: string;
    updatedAt: string;
}

interface EmployeeDTO {
    id: number;
    name: string;
    email: string;
    role: string;
}

@Component({
    selector: 'request-detail',
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        DatePipe,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
    ],
    template: `
        <section class="page-shell">
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
                                <button mat-raised-button color="accent" (click)="acceptRequest()">
                                    Accept
                                </button>
                            } @else {
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
                                <button mat-raised-button color="primary" (click)="updateStatus()">
                                    Update Status
                                </button>
                            }
                        </div>
                    }
                </div>
            </header>

            <div class="content" *ngIf="request()">
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
                                <label>Related Asset</label>
                                <p>
                                    {{
                                        request()?.assetId ? 'Asset #' + request()!.assetId : 'None'
                                    }}
                                </p>
                            </div>
                            <div class="detail-item">
                                <label>Requested By</label>
                                <p>{{ getEmployeeName(request()?.employeeId) }}</p>
                            </div>
                            <div class="detail-item">
                                <label>Created</label>
                                <p>{{ request()?.createdAt | date: 'medium' }}</p>
                            </div>
                            <div class="detail-item">
                                <label>Updated</label>
                                <p>{{ request()?.updatedAt | date: 'medium' }}</p>
                            </div>
                        </div>
                        <div class="description">
                            <label>Description</label>
                            <p>{{ request()?.description }}</p>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>
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
                font-weight: bold;
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
                font-weight: bold;
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

        `,
    ],
})
export class RequestDetailComponent implements OnInit {
    private apiService = inject(ApiService);
    private snackbarService = inject(SnackbarService);
    private route = inject(ActivatedRoute);
    private recentItemsService = inject(RecentItemsService);
    userService = inject(UserService);

    request = signal<RequestDTO | null>(null);
    employees = signal<Map<number, EmployeeDTO>>(new Map());
    selectedStatus = signal('');
    accepted = signal(false);
    isLoading = signal(false);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadRequest(Number(id));
            this.loadEmployees();
            this.checkIfAccepted(Number(id));
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

        const updated = { ...currentRequest, status: this.selectedStatus() };
        this.apiService.put<RequestDTO>(`requests/${currentRequest.id}`, updated).subscribe({
            next: () => {
                this.snackbarService.success('Status updated');
                this.loadRequest(currentRequest.id);
            },
            error: () => this.snackbarService.error('Failed to update status'),
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
                this.accepted.set(true);
                this.isLoading.set(false);
                this.snackbarService.success('Request accepted');
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
}
