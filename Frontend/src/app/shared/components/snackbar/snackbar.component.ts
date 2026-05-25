import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
    selector: 'app-snackbar-container',
    styleUrl: './snackbar.component.scss',
    imports: [CommonModule, MatButtonModule, MatIconModule],
    template: `
        <div class="snackbar-container">
            @for (
                snack of ((snackbars$ | async) || []).slice().reverse();
                let i = $index;
                track snack.id
            ) {
                @if (i < 3) {
                    <div class="snackbar-item" [ngClass]="snack.type" [style.top.px]="i * 70">
                        <span class="snackbar-message">{{ snack.message }}</span>
                        @if (i === 2 && ((snackbars$ | async)?.length || 0) > 3) {
                            <span class="snackbar-badge"
                                >+{{ ((snackbars$ | async)?.length || 0) - 3 }}</span
                            >
                        }
                        <button (click)="closeSnackbar(snack.id)" class="close-btn">
                            <mat-icon>close_small</mat-icon>
                        </button>
                    </div>
                }
            }
        </div>
    `,
})
export class SnackbarComponent {
    private snackbarService = inject(SnackbarService);
    snackbars$ = this.snackbarService.snackbars;

    closeSnackbar(id: string) {
        this.snackbarService.close(id);
    }
}
