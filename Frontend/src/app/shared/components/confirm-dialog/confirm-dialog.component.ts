import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
    template: `
        <div class="confirm-dialog-container">
            <div class="confirm-header">
                <mat-icon class="warning-icon">warning</mat-icon>
                <h2>{{ title }}</h2>
            </div>
            <p class="confirm-message">{{ message }}</p>
            <div class="confirm-actions">
                <button mat-stroked-button (click)="onCancel()">Cancel</button>
                <button mat-raised-button color="warn" (click)="onConfirm()">{{ confirmLabel }}</button>
            </div>
        </div>
    `,
    styles: [
        `
            .confirm-dialog-container {
                padding: 24px;
                min-width: 300px;
                max-width: 400px;
            }

            .confirm-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }

            .warning-icon {
                color: #ff9800;
                font-size: 28px;
                width: 28px;
                height: 28px;
            }

            h2 {
                margin: 0;
                color: var(--text-primary);
                font-size: 18px;
                font-weight: 600;
            }

            .confirm-message {
                color: var(--text-secondary);
                margin: 12px 0 24px 0;
                line-height: 1.5;
            }

            .confirm-actions {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
            }

            button {
                min-width: 100px;
            }
        `,
    ],
})
export class ConfirmDialogComponent {
    private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
    title = 'Confirm Action';
    message = 'Are you sure?';
    confirmLabel = 'Delete';

    onConfirm() {
        this.dialogRef.close(true);
    }

    onCancel() {
        this.dialogRef.close(false);
    }
}
