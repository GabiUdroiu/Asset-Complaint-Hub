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
    selector: 'add-employee-dialog',
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
            <h2>Add New Employee</h2>

            <form (ngSubmit)="onSubmit()">
                <div class="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        [(ngModel)]="form.name"
                        name="name"
                        placeholder="Employee full name"
                        required
                    />
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        [(ngModel)]="form.email"
                        name="email"
                        placeholder="employee@example.com"
                        required
                    />
                </div>

                <div class="form-group">
                    <label>Role</label>
                    <select [(ngModel)]="form.role" name="role">
                        <option value="USER">User</option>
                        <option value="DEPT_RESPONSIBLE">Dept Responsible</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Department</label>
                    <select [(ngModel)]="form.departmentId" name="departmentId">
                        <option value="" disabled>Select a department</option>
                        <option value="1">IT</option>
                        <option value="2">HR</option>
                        <option value="3">Operations</option>
                    </select>
                </div>

                <div class="form-actions">
                    <button type="button" (click)="onCancel()" class="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-submit">Add Employee</button>
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
export class AddEmployeeDialogComponent {
    private apiService = inject(ApiService);
    private dialogRef = inject(MatDialogRef<AddEmployeeDialogComponent>);

    form = {
        name: '',
        email: '',
        role: 'USER',
        departmentId: '',
    };

    onSubmit() {
        if (!this.form.name || !this.form.email || !this.form.departmentId) {
            alert('Please fill in all required fields');
            return;
        }

        const payload = {
            name: this.form.name,
            email: this.form.email,
            role: this.form.role,
            departmentId: Number(this.form.departmentId),
        };

        this.apiService.post('employees', payload).subscribe({
            next: () => this.dialogRef.close(true),
            error: () => alert('Failed to add employee'),
        });
    }

    onCancel() {
        this.dialogRef.close(false);
    }
}
