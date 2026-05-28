import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../shared/services/api.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { UserService } from '../../../core/services/user.service';
import { Asset } from '../../../shared/models';

type View = 'detail' | 'complaint' | 'request';
type RequestKind = 'STATUS_CHANGE' | 'UPGRADE';

@Component({
    selector: 'asset-detail-dialog',
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule,
        MatTooltipModule,
    ],
    template: `
        <div class="dialog-wrapper">
            <!-- Header -->
            <div class="dialog-header">
                <div class="header-info">
                    <mat-icon class="asset-icon">inventory_2</mat-icon>
                    <div>
                        <h2 class="asset-name">{{ asset.name }}</h2>
                        <span class="serial">{{ asset.serialNumber }}</span>
                    </div>
                </div>
                <div class="header-actions">
                    <button mat-icon-button mat-dialog-close matTooltip="Close">
                        <mat-icon>close</mat-icon>
                    </button>
                </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Detail view -->
            @if (view() === 'detail') {
                <div class="detail-body">
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Category</label>
                            <p>{{ asset.category }}</p>
                        </div>
                        <div class="detail-item">
                            <label>Status</label>
                            <p>{{ asset.status | titlecase }}</p>
                        </div>
                        <div class="detail-item">
                            <label>Asset ID</label>
                            <p>#{{ asset.id }}</p>
                        </div>
                        <div class="detail-item">
                            <label>Assigned to Employee</label>
                            <p>{{ (asset.employeeId && asset.employeeName) ? '#' + asset.employeeId + ' - ' + asset.employeeName : 'Unassigned (Storage)' }}</p>
                        </div>
                        @if (asset.lastUpdated) {
                        <div class="detail-item">
                            <label>Last Updated</label>
                            <p>{{ formatDate(asset.lastUpdated) }}</p>
                        </div>
                        }
                    </div>

                    <mat-divider></mat-divider>

                    <div class="quick-actions">
                        <p class="actions-label">Quick Actions</p>
                        <div class="action-buttons">
                            <button mat-stroked-button (click)="view.set('complaint')">
                                <mat-icon>warning</mat-icon>
                                File a Complaint
                            </button>
                            <button mat-stroked-button (click)="openRequest('UPGRADE')">
                                <mat-icon>upgrade</mat-icon>
                                Request Upgrade
                            </button>
                            <button mat-stroked-button color="warn" (click)="requestStatusChange()">
                                <mat-icon>{{ asset.status === 'inactive' ? 'check_circle' : 'block' }}</mat-icon>
                                Request Status Change
                            </button>
                        </div>
                    </div>
                </div>
            }

            <!-- File complaint view -->
            @if (view() === 'complaint') {
                <div class="form-body">
                    <div class="form-breadcrumb">
                        <button mat-icon-button (click)="view.set('detail')" matTooltip="Back">
                            <mat-icon>arrow_back</mat-icon>
                        </button>
                        <span>File a Complaint for <strong>{{ asset.name }}</strong></span>
                    </div>
                    <div class="form-fields">
                        <div class="form-group">
                            <label>Title <span class="required">*</span></label>
                            <input
                                type="text"
                                [(ngModel)]="complaintForm.title"
                                placeholder="Brief description of the issue"
                            />
                        </div>
                        <div class="form-group">
                            <label>Description <span class="required">*</span></label>
                            <textarea
                                [(ngModel)]="complaintForm.description"
                                rows="4"
                                placeholder="Describe the issue in detail..."
                            ></textarea>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button mat-button (click)="view.set('detail')">Cancel</button>
                        <button matButton="filled" color="warn" (click)="submitComplaint()" [disabled]="isSubmitting()">
                            <mat-icon>send</mat-icon>
                            Submit Complaint
                        </button>
                    </div>
                </div>
            }

            <!-- Request view -->
            @if (view() === 'request') {
                <div class="form-body">
                    <div class="form-breadcrumb">
                        <button mat-icon-button (click)="view.set('detail')" matTooltip="Back">
                            <mat-icon>arrow_back</mat-icon>
                        </button>
                        <span>
                            {{ requestKind() === 'UPGRADE' ? 'Request Upgrade for' : 'Request Status Change for' }}
                            <strong>{{ asset.name }}</strong>
                        </span>
                    </div>
                    <div class="form-fields">
                        <div class="form-group">
                            <label>Title <span class="required">*</span></label>
                            <input
                                type="text"
                                [(ngModel)]="requestForm.title"
                                placeholder="Brief title for the request"
                            />
                        </div>
                        <div class="form-group">
                            <label>Description <span class="required">*</span></label>
                            <textarea
                                [(ngModel)]="requestForm.description"
                                rows="4"
                                placeholder="Explain your request..."
                            ></textarea>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button mat-button (click)="view.set('detail')">Cancel</button>
                        <button matButton="filled" color="primary" (click)="submitRequest()" [disabled]="isSubmitting()">
                            <mat-icon>send</mat-icon>
                            Submit Request
                        </button>
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        .dialog-wrapper {
            min-width: 480px;
            max-width: 560px;
        }

        .dialog-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px 16px;
            gap: 16px;
        }

        .header-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .asset-icon {
            font-size: 2rem;
            width: 2rem;
            height: 2rem;
            color: var(--color-primary);
            opacity: 0.8;
        }

        .asset-name {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .serial {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);

            .dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            &.active .dot { background-color: #4caf50; }
            &.inactive .dot { background-color: #757575; }
            &.maintenance .dot { background-color: #ff9800; }
        }

        .detail-body {
            padding: 20px 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .detail-item label {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-secondary);
            margin-bottom: 4px;
        }

        .detail-item p {
            margin: 0;
            font-size: 0.95rem;
            color: var(--text-primary);
        }

        .actions-label {
            margin: 0 0 12px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-secondary);
        }

        .action-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .action-buttons button {
            flex: 1;
            min-width: 140px;
        }

        .form-body {
            padding: 16px 24px 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .form-breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }

        .form-fields {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .form-group label {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-secondary);
        }

        .required {
            color: #f44336;
        }

        input, textarea {
            padding: 10px 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 0.9rem;
            font-family: inherit;
            background-color: var(--bg-secondary);
            color: var(--text-primary);
            resize: vertical;
            transition: border-color 0.2s;

            &:focus {
                outline: none;
                border-color: var(--color-primary);
            }
        }

        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding-top: 4px;
        }
    `],
})
export class AssetDetailDialogComponent {
    private apiService = inject(ApiService);
    private snackbarService = inject(SnackbarService);
    private userService = inject(UserService);
    private dialogRef = inject(MatDialogRef<AssetDetailDialogComponent>);
    asset: Asset = inject(MAT_DIALOG_DATA);

    view = signal<View>('detail');
    requestKind = signal<RequestKind>('UPGRADE');
    isSubmitting = signal(false);

    complaintForm = { title: '', description: '' };
    requestForm = { title: '', description: '' };

    openRequest(kind: RequestKind) {
        this.requestKind.set(kind);
        this.requestForm.title = kind === 'UPGRADE'
            ? `Upgrade request for ${this.asset.name}`
            : `Status change request for ${this.asset.name}`;
        this.requestForm.description = '';
        this.view.set('request');
    }

    requestStatusChange() {
        this.openRequest('STATUS_CHANGE');
    }

    formatDate(date: any): string {
        if (Array.isArray(date)) {
            const [year, month, day, hour = 0, minute = 0] = date;
            return new Date(year, month - 1, day, hour, minute).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
        }
        if (date instanceof Date) {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
        }
        return date
            ? new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
              })
            : '';
    }

    submitComplaint() {
        if (!this.complaintForm.title.trim() || !this.complaintForm.description.trim()) {
            this.snackbarService.error('Please fill in all fields');
            return;
        }
        const userId = this.userService.currentUser()?.id;
        if (!userId) return;

        this.isSubmitting.set(true);
        const payload = {
            title: this.complaintForm.title,
            description: this.complaintForm.description,
            assetId: this.asset.id,
            employeeId: userId,
            status: 'NEW',
        };
        this.apiService.post('complaints', payload).subscribe({
            next: () => {
                this.snackbarService.success('Complaint submitted successfully');
                this.dialogRef.close({ reload: false });
            },
            error: () => {
                this.isSubmitting.set(false);
                this.snackbarService.error('Failed to submit complaint');
            },
        });
    }

    submitRequest() {
        if (!this.requestForm.title.trim() || !this.requestForm.description.trim()) {
            this.snackbarService.error('Please fill in all fields');
            return;
        }
        const userId = this.userService.currentUser()?.id;
        if (!userId) return;

        this.isSubmitting.set(true);
        const payload = {
            title: this.requestForm.title,
            description: this.requestForm.description,
            assetId: this.asset.id,
            employeeId: userId,
            status: 'PENDING',
            priority: this.requestKind() === 'UPGRADE' ? 'MEDIUM' : 'LOW',
        };
        this.apiService.post('requests', payload).subscribe({
            next: () => {
                this.snackbarService.success('Request submitted successfully');
                this.dialogRef.close({ reload: false });
            },
            error: () => {
                this.isSubmitting.set(false);
                this.snackbarService.error('Failed to submit request');
            },
        });
    }
}
