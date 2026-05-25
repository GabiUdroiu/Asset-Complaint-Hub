import { Component, inject, signal, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeDTO } from '../../services/employee.service';

@Component({
    selector: 'task-assignment-dialog',
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
    ],
    template: `
        <h2 mat-dialog-title>Assign Task</h2>
        <mat-dialog-content>
            <form [formGroup]="form">
                <mat-form-field appearance="fill" class="full-width">
                    <mat-label>Select Employee</mat-label>
                    <mat-select formControlName="employeeId">
                        @for (emp of employees(); track emp.id) {
                            <mat-option [value]="emp.id">
                                {{ emp.name }} ({{ emp.role }})
                            </mat-option>
                        }
                    </mat-select>
                </mat-form-field>
            </form>
            @if (isLoading()) {
                <mat-spinner diameter="30"></mat-spinner>
            }
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Cancel</button>
            <button mat-raised-button color="primary" (click)="onAssign()" [disabled]="!form.valid">
                Assign
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .full-width {
            width: 100%;
            min-width: 300px;
        }
        mat-dialog-content {
            padding: 20px;
        }
        mat-spinner {
            margin: 20px auto;
        }
    `]
})
export class TaskAssignmentDialogComponent implements OnInit {
    private dialogRef = inject(MatDialogRef<TaskAssignmentDialogComponent>);
    private employeeService = inject(EmployeeService);
    private fb = inject(FormBuilder);

    employees = signal<EmployeeDTO[]>([]);
    isLoading = signal(false);
    form: FormGroup;

    constructor() {
        this.form = this.fb.group({
            employeeId: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.isLoading.set(true);
        this.employeeService.getEmployees().subscribe({
            next: (response: any) => {
                this.employees.set(response.data?.items ?? []);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            }
        });
    }

    onCancel() {
        this.dialogRef.close();
    }

    onAssign() {
        if (this.form.valid) {
            this.dialogRef.close({
                employeeId: this.form.value.employeeId
            });
        }
    }
}
