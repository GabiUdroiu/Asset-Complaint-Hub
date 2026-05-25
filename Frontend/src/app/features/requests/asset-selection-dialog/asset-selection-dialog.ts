import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    MatDialogRef,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiService, ApiResponse } from '../../../shared/services/api.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';

interface Asset {
    id: number;
    name: string;
    category: string;
    status: string;
}

@Component({
    selector: 'app-asset-selection-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatPaginatorModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
    ],
    template: `
        <h2 mat-dialog-title>Select Assets</h2>
        <mat-dialog-content class="asset-dialog-content">
            <div class="search-box">
                <mat-icon>search</mat-icon>
                <input
                    type="text"
                    placeholder="Search assets..."
                    [(ngModel)]="searchTerm"
                    (ngModelChange)="filterAssets()"
                />
            </div>

            @if (filteredAssets().length === 0) {
                <p class="no-assets">No assets found</p>
            } @else {
                <div class="assets-list">
                    @for (asset of paginatedAssets(); track asset.id) {
                        <div class="asset-item">
                            <input
                                type="checkbox"
                                [id]="'asset-' + asset.id"
                                [ngModel]="isSelected(asset.id)"
                                (ngModelChange)="toggleAsset(asset)"
                            />
                            <label [for]="'asset-' + asset.id" class="asset-label">
                                <span class="asset-name">{{ asset.name }}</span>
                                <span class="asset-category">{{ asset.category }}</span>
                            </label>
                        </div>
                    }
                </div>

                <div class="pagination-controls">
                    <button
                        mat-icon-button
                        (click)="previousPage()"
                        [disabled]="currentPage() === 0"
                        title="Previous page"
                    >
                        <mat-icon>chevron_left</mat-icon>
                    </button>
                    <span class="page-info">
                        Page {{ currentPage() + 1 }} of {{ totalPages() }}
                    </span>
                    <button
                        mat-icon-button
                        (click)="nextPage()"
                        [disabled]="currentPage() >= totalPages() - 1"
                        title="Next page"
                    >
                        <mat-icon>chevron_right</mat-icon>
                    </button>
                </div>
            }
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Cancel</button>
            <button
                mat-raised-button
                color="primary"
                (click)="onSubmit()"
            >
                {{ selectedAssets().length > 0 ? 'Add ' + selectedAssets().length + ' Asset(s)' : 'Create Request' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [
        `
            .asset-dialog-content {
                min-width: 400px;
                max-height: 500px;
                overflow-y: auto;
                padding: 20px 0;
            }

            .search-box {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 0 20px 15px;
                border-bottom: 1px solid var(--border-color);
            }

            .search-box input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                background-color: var(--bg-primary);
                color: var(--text-primary);
                font-size: 14px;
            }

            .no-assets {
                text-align: center;
                color: var(--text-tertiary);
                padding: 20px;
            }

            .assets-list {
                padding: 0 20px;
                min-height: 200px;
            }

            .asset-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .asset-item:hover {
                background-color: var(--bg-secondary);
            }

            .asset-item input[type='checkbox'] {
                margin: 0;
                cursor: pointer;
            }

            .asset-label {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
                cursor: pointer;
            }

            .asset-name {
                font-weight: 500;
                color: var(--text-primary);
            }

            .asset-category {
                font-size: 12px;
                color: var(--text-secondary);
            }

            .pagination-controls {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                padding: 15px 20px;
                border-top: 1px solid var(--border-color);
            }

            .page-info {
                color: var(--text-secondary);
                font-size: 12px;
                min-width: 120px;
                text-align: center;
            }

            button[mat-icon-button]:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `,
    ],
})
export class AssetSelectionDialogComponent {
    private apiService = inject(ApiService);
    private snackbarService = inject(SnackbarService);
    private dialogRef = inject(MatDialogRef<AssetSelectionDialogComponent>);

    assets = signal<Asset[]>([]);
    filteredAssets = signal<Asset[]>([]);
    selectedAssets = signal<Asset[]>([]);
    searchTerm = '';
    currentPage = signal(0);
    pageSize = 5;

    paginatedAssets = signal<Asset[]>([]);
    totalPages = signal(0);

    constructor() {
        this.loadAssets();
    }

    loadAssets() {
        this.apiService.get<{ items: Asset[] }>('assets?page=0&size=100').subscribe({
            next: (response: ApiResponse<{ items: Asset[] }>) => {
                this.assets.set(response.data.items || []);
                this.filteredAssets.set(response.data.items || []);
                this.updatePagination();
            },
        });
    }

    filterAssets() {
        if (!this.searchTerm.trim()) {
            this.filteredAssets.set(this.assets());
        } else {
            const search = this.searchTerm.toLowerCase();
            this.filteredAssets.set(
                this.assets().filter(
                    (a) =>
                        a.name.toLowerCase().includes(search) ||
                        a.category.toLowerCase().includes(search),
                ),
            );
        }
        this.currentPage.set(0);
        this.updatePagination();
    }

    updatePagination() {
        const total = this.filteredAssets().length;
        this.totalPages.set(Math.ceil(total / this.pageSize));
        const start = this.currentPage() * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedAssets.set(this.filteredAssets().slice(start, end));
    }

    nextPage() {
        if (this.currentPage() < this.totalPages() - 1) {
            this.currentPage.set(this.currentPage() + 1);
            this.updatePagination();
        }
    }

    previousPage() {
        if (this.currentPage() > 0) {
            this.currentPage.set(this.currentPage() - 1);
            this.updatePagination();
        }
    }

    isSelected(assetId: number): boolean {
        return this.selectedAssets().some((a) => a.id === assetId);
    }

    toggleAsset(asset: Asset) {
        const selected = this.selectedAssets();
        if (this.isSelected(asset.id)) {
            this.selectedAssets.set(selected.filter((a) => a.id !== asset.id));
        } else {
            this.selectedAssets.set([...selected, asset]);
        }
    }

    onCancel() {
        this.dialogRef.close(null);
    }

    onSubmit() {
        this.dialogRef.close(this.selectedAssets());
    }
}
