import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    MatDialogRef,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-export-dialog',
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatRadioModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
    ],
    template: `
        <h2 mat-dialog-title>Export Report</h2>
        <mat-dialog-content>
            <div class="export-options">
                <div class="option-group">
                    <h3>Data Scope</h3>
                    <mat-radio-group [(ngModel)]="scope">
                        <mat-radio-button value="with-filters"
                            >With Current Filters</mat-radio-button
                        >
                        <mat-radio-button value="all">Export All Data</mat-radio-button>
                    </mat-radio-group>
                </div>

                <div class="option-group">
                    <h3>File Format</h3>
                    <mat-radio-group [(ngModel)]="format">
                        <mat-radio-button value="pdf">
                            <span>PDF</span>
                        </mat-radio-button>
                        <mat-radio-button value="csv">
                            <span>CSV</span>
                        </mat-radio-button>
                    </mat-radio-group>
                </div>
            </div>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Cancel</button>
            <button mat-raised-button color="primary" (click)="onExport()">Export</button>
        </mat-dialog-actions>
    `,
    styles: [
        `
            mat-dialog-content {
                padding: 30px 0;
                min-width: 300px;
                min-height: 300px;
            }

            .export-options {
                display: flex;
                flex-direction: column;
                gap: 32px;
                height: 100%;
            }

            .option-group {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .option-group h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 500;
                color: var(--text-primary);
            }

            mat-radio-group {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
        `,
    ],
})
export class ExportDialogComponent {
    private dialogRef = inject(MatDialogRef<ExportDialogComponent>);

    scope = signal<'with-filters' | 'all'>('with-filters');
    format = signal<'pdf' | 'csv'>('pdf');

    onCancel(): void {
        this.dialogRef.close(null);
    }

    onExport(): void {
        this.dialogRef.close({
            scope: this.scope(),
            format: this.format(),
        });
    }
}
