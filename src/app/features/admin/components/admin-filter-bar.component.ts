import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'admin-filter-bar',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatTooltipModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <section class="filters-section">
      <!-- Search Input -->
      <mat-form-field>
        <mat-label>Search</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          [(ngModel)]="searchValue"
          (ngModelChange)="onSearchChange($event)"
          [placeholder]="searchPlaceholder"
        />
      </mat-form-field>

      <!-- Status Filter -->
      @if (statusOptions && statusOptions.length > 0) {
        <mat-form-field>
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="onFilterChange()">
            <mat-option value="">All Statuses</mat-option>
            @for (opt of statusOptions; track opt.value) {
              <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }

      <!-- Category Filter -->
      @if (categoryOptions && categoryOptions.length > 0) {
        <mat-form-field>
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="selectedCategory" (ngModelChange)="onFilterChange()">
            <mat-option value="">All Categories</mat-option>
            @for (opt of categoryOptions; track opt.value) {
              <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }

      <!-- Role Filter -->
      @if (roleOptions && roleOptions.length > 0) {
        <mat-form-field>
          <mat-label>Role</mat-label>
          <mat-select [(ngModel)]="selectedRole" (ngModelChange)="onFilterChange()">
            <mat-option value="">All Roles</mat-option>
            @for (opt of roleOptions; track opt.value) {
              <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }

      <div class="filter-right">
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styles: [`
    .filters-section {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 20px;

      mat-form-field {
        min-width: 160px;
        flex: 1;
      }

      button {
        flex-shrink: 0;
      }

      [mat-icon-button] {
        padding: 0;
      }
    }

    .mat-mdc-form-field {
      background: transparent !important;
    }

    ::ng-deep .mdc-text-field {
      background-color: transparent !important;
    }

    ::ng-deep input.mat-mdc-input-element {
      background: transparent !important;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      font-size: 14px;
    }

    ::ng-deep input.mat-mdc-input-element::placeholder {
      color: var(--text-tertiary);
    }

    .filter-right {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-shrink: 0;
    }
  `]
})
export class AdminFilterBarComponent {
  @Input() searchValue: string = '';
  @Output() searchValueChange = new EventEmitter<string>();
  @Input() searchPlaceholder: string = 'Search...';
  @Input() statusOptions: FilterOption[] = [];
  @Input() categoryOptions: FilterOption[] = [];
  @Input() roleOptions: FilterOption[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<{status?: string; category?: string; role?: string}>();

  selectedStatus: string = '';
  selectedCategory: string = '';
  selectedRole: string = '';

  onSearchChange(value: string) {
    this.searchValue = value;
    this.searchValueChange.emit(value);
    this.searchChange.emit(value);
  }

  onFilterChange() {
    this.filterChange.emit({
      status: this.selectedStatus || undefined,
      category: this.selectedCategory || undefined,
      role: this.selectedRole || undefined,
    });
  }
}
