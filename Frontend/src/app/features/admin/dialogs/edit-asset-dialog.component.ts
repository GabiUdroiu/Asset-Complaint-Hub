import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../../shared/services/api.service';

@Component({
    selector: 'edit-asset-dialog',
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
    ],
    template: `
        <div class="dialog-container">
            <h2>Edit Asset</h2>

            <form (ngSubmit)="onSubmit()">
                <div class="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        [(ngModel)]="form.name"
                        name="name"
                        placeholder="Asset name"
                        required
                    />
                </div>

                <div class="form-group">
                    <label>Serial Number</label>
                    <input
                        type="text"
                        [(ngModel)]="form.serialNumber"
                        name="serialNumber"
                        placeholder="e.g., DLL-2024-001"
                    />
                </div>

                <div class="form-group">
                    <label>Category</label>
                    <select [(ngModel)]="form.category" name="category">
                        <option value="Laptop">Laptop</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Phone">Phone</option>
                        <option value="Tablet">Tablet</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Status</label>
                    <select [(ngModel)]="form.status" name="status">
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Assign to Employee (Optional)</label>
                    <input
                        type="number"
                        [(ngModel)]="form.employeeId"
                        name="employeeId"
                        placeholder="Employee ID (leave empty to add to storage)"
                    />
                </div>

                <div class="form-actions">
                    <button type="button" (click)="onCancel()" class="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-submit">Update Asset</button>
                </div>
            </form>
        </div>
    `,
    styles: [
        `
            .dialog-container {
                padding: 20px;
                min-width: 400px;
            }

            h2 {
                margin-top: 0;
                color: #333;
            }

            form {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
            }

            label {
                font-weight: 600;
                margin-bottom: 5px;
                color: #555;
            }

            input,
            select {
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                font-family: inherit;
            }

            input:focus,
            select:focus {
                outline: none;
                border-color: #2196f3;
                box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
            }

            .form-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
            }

            .btn-cancel {
                padding: 8px 16px;
                background: #eee;
                color: #333;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }

            .btn-cancel:hover {
                background: #ddd;
            }

            .btn-submit {
                padding: 8px 16px;
                background: #2196f3;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }

            .btn-submit:hover {
                background: #1976d2;
            }
        `,
    ],
})
export class EditAssetDialogComponent {
    private apiService = inject(ApiService);
    private dialogRef = inject(MatDialogRef<EditAssetDialogComponent>);
    private asset = inject(MAT_DIALOG_DATA);

    form = {
        name: this.asset?.name || '',
        serialNumber: this.asset?.serialNumber || '',
        category: this.asset?.category || 'Laptop',
        status: this.asset?.status || 'ACTIVE',
        employeeId: this.asset?.employeeId || null as number | null,
    };

    onSubmit() {
        if (!this.form.name || !this.form.serialNumber) {
            alert('Please fill in all required fields');
            return;
        }

        this.apiService.put(`assets/${this.asset.id}`, this.form).subscribe({
            next: () => this.dialogRef.close(true),
            error: () => alert('Failed to update asset'),
        });
    }

    onCancel() {
        this.dialogRef.close(false);
    }
}
