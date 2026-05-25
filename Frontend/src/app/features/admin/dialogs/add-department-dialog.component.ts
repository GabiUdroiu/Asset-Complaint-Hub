import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../shared/services/api.service';

@Component({
    selector: 'add-department-dialog',
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
            <h2>Add New Department</h2>

            <form (ngSubmit)="onSubmit()">
                <div class="form-group">
                    <label>Department Name</label>
                    <input
                        type="text"
                        [(ngModel)]="form.name"
                        name="name"
                        placeholder="e.g., IT, HR, Operations"
                        required
                    />
                </div>

                <div class="form-group">
                    <label>Responsible Employee ID (Optional)</label>
                    <input
                        type="number"
                        [(ngModel)]="form.responsibleEmployeeId"
                        name="responsibleEmployeeId"
                        placeholder="Leave empty if not assigned yet"
                    />
                </div>

                <div class="form-actions">
                    <button type="button" (click)="onCancel()" class="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-submit">Add Department</button>
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
export class AddDepartmentDialogComponent {
    private apiService = inject(ApiService);
    private dialogRef = inject(MatDialogRef<AddDepartmentDialogComponent>);

    form = {
        name: '',
        responsibleEmployeeId: null,
    };

    onSubmit() {
        if (!this.form.name) {
            alert('Please enter department name');
            return;
        }

        const payload: any = {
            name: this.form.name,
        };

        if (this.form.responsibleEmployeeId) {
            payload.responsibleEmployeeId = this.form.responsibleEmployeeId;
        }

        this.apiService.post('departments', payload).subscribe({
            next: () => this.dialogRef.close(true),
            error: () => alert('Failed to add department'),
        });
    }

    onCancel() {
        this.dialogRef.close(false);
    }
}
