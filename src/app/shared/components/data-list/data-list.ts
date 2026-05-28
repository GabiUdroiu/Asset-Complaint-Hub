import {
    Component,
    OnInit,
    OnDestroy,
    inject,
    signal,
    computed,
    input,
    contentChild,
    TemplateRef,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SnackbarService } from '../../services/snackbar.service';
import { ALL_MATERIAL, COMMON_MATERIAL, TABLE_MATERIAL } from '../../material-base';
import { ColumnDef, SelectOption, LoadFn } from './data-list.types';
import { PageEvent } from '@angular/material/paginator';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
    selector: 'app-data-list',
    imports: [
        CommonModule,
        RouterLink,
        ReactiveFormsModule,
        FormsModule,
        TruncatePipe,
        ...COMMON_MATERIAL,
        ...TABLE_MATERIAL,
    ],
    templateUrl: './data-list.html',
    styleUrls: ['./data-list.scss'],
})
export class DataListComponent implements OnInit, OnDestroy {
    private snackbarService = inject(SnackbarService);
    private sanitizer = inject(DomSanitizer);
    private destroy$ = new Subject<void>();

    pageTitle = input.required<string>();
    columnDefs = input.required<any>();
    loadFn = input.required<LoadFn>();

    pageSubtitle = input<string>('');
    backRoute = input<string>('/home');
    emptyStateIcon = input<string>('inbox');
    emptyStateMessage = input<string>('No items found');
    emptyStateFilteredMessage = input<string>('Adjust your filters to see results');
    displayedColumns = input<string[]>([]);
    statusOptions = input<SelectOption[]>([]);
    categoryOptions = input<SelectOption[]>([]);
    departmentOptions = input<SelectOption[]>([]);
    showCategoryFilter = input<boolean>(false);
    showDepartmentFilter = input<boolean>(false);
    departmentFilterDisabled = input<boolean>(false);
    initialDepartmentId = input<string | null>(null);
    showViewModeToggle = input<boolean>(false);
    actionButton = input<{ label: string; icon?: string; click: () => void } | null>(null);
    secondaryActionButton = input<{ label?: string; icon: string; click: () => void } | null>(null);

    cardTemplate = contentChild<TemplateRef<any>>('cardTemplate');

    items = signal<any[]>([]);
    loading = signal(false);
    total = signal(0);
    currentPage = signal(0);
    pageSize = signal(10);
    viewMode = signal<'cards' | 'table'>('cards');

    filterSearch = signal('');
    filterStatus = signal('');
    filterCategory = signal('');
    filterDepartment = signal<string | null>(null);

    searchControl = new FormControl('');
    statusControl = new FormControl<string>('');
    categoryControl = new FormControl<string>('');

    hasActiveFilters = computed(
        () => !!this.filterSearch() || !!this.filterStatus() || !!this.filterCategory(),
    );

    normalizedColumnDefs = computed(() => {
        const cols = this.columnDefs();
        if (typeof cols === 'function') {
            return (cols as any)();
        }
        return cols;
    });

    effectiveColumns = computed(() => {
        const explicit = this.displayedColumns();
        if (explicit.length > 0) return explicit;
        return this.normalizedColumnDefs().map((c: ColumnDef) => c.key);
    });

    ngOnInit(): void {
        if (this.initialDepartmentId()) {
            this.filterDepartment.set(this.initialDepartmentId());
        }

        this.searchControl.valueChanges
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe((value) => {
                this.filterSearch.set(value ?? '');
                this.currentPage.set(0);
                this.loadData();
            });

        this.statusControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
            this.filterStatus.set(value ?? '');
            this.currentPage.set(0);
            this.loadData();
        });

        this.categoryControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
            this.filterCategory.set(value ?? '');
            this.currentPage.set(0);
            this.loadData();
        });

        this.loadData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadData(): void {
        this.loading.set(true);
        const filters = {
            search: this.filterSearch() || undefined,
            status: this.filterStatus() || undefined,
            category: this.filterCategory() || undefined,
            departmentId: this.filterDepartment() ? Number(this.filterDepartment()) : undefined,
        };
        this.loadFn()(
            { page: this.currentPage(), size: this.pageSize() },
            filters,
        )
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result) => {
                    this.items.set(result.items || []);
                    this.total.set(result.total || 0);
                    this.loading.set(false);
                },
                error: () => {
                    this.snackbarService.error('Failed to load data');
                    this.items.set([]);
                    this.total.set(0);
                    this.loading.set(false);
                },
            });
    }

    onPageChange(event: PageEvent): void {
        this.currentPage.set(event.pageIndex);
        this.pageSize.set(event.pageSize);
        this.loadData();
    }

    getCellValue(col: ColumnDef, row: any): string {
        if (col.cell) return col.cell(row);
        return row[col.key] ?? '';
    }

    getHtmlCellValue(col: ColumnDef, row: any): SafeHtml {
        if (col.htmlCell) {
            return this.sanitizer.bypassSecurityTrustHtml(col.htmlCell(row));
        }
        return this.sanitizer.bypassSecurityTrustHtml(this.getCellValue(col, row));
    }

    hasHtmlCell(col: ColumnDef): boolean {
        return !!col.htmlCell;
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
}
