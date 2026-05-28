import { Injectable, inject, computed, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../core/services/user.service';
import { DepartmentService } from './department.service';
import { SnackbarService } from './snackbar.service';
import { ApiService } from './api.service';
import {
  Department,
  UserRoleEnum,
  ReportFormat,
  ReportScope,
  SelectOption,
} from '../models';

/**
 * BaseListService provides shared functionality for list components
 * (Complaints, Assets, etc.) to reduce code duplication
 */
@Injectable()
export abstract class BaseListService {
  protected apiService = inject(ApiService);
  protected dialog = inject(MatDialog);
  protected snackbarService = inject(SnackbarService);
  protected userService = inject(UserService);
  protected departmentService = inject(DepartmentService);

  // Shared state
  protected readonly department = signal<string | null>(null);
  protected readonly departments = signal<Department[]>([]);

  /**
   * Computed signal: Whether current user can export reports
   * (Admin or Department Responsible)
   */
  readonly canExport = computed(() => {
    const user = this.userService.currentUser();
    const role = user?.role;
    return (
      role === 'ADMIN' || role === 'DEPT_RESPONSIBLE'
    );
  });

  /**
   * Computed signal: Whether department filter is disabled
   * (disabled for Department Responsible users - they see only their dept)
   */
  readonly departmentFilterDisabled = computed(() => {
    const user = this.userService.currentUser();
    return user?.role === 'DEPT_RESPONSIBLE';
  });

  /**
   * Computed signal: Initial department ID for filter
   * (automatically set for Department Responsible users)
   */
  readonly initialDepartmentId = computed(() => {
    const user = this.userService.currentUser();
    if (user?.role === 'DEPT_RESPONSIBLE' && user?.departmentId) {
      return String(user.departmentId);
    }
    return null;
  });

  /**
   * Convert departments to SelectOption format for filters
   */
  readonly departmentOptions = computed((): SelectOption[] =>
    this.departments().map((d) => ({ value: String(d.id), label: d.name }))
  );

  /**
   * Load all departments from service
   */
  protected loadDepartments(): void {
    this.departmentService.getDepartments().subscribe((deps: Department[]) => {
      this.departments.set(deps);
    });
  }

  /**
   * Download report (PDF or CSV) from backend
   * @param endpoint API endpoint (e.g., 'reports/complaints')
   * @param filename Output filename (e.g., 'complaints_report.pdf')
   * @param format Report format ('pdf' or 'csv')
   * @param scope Report scope ('all' or 'with-filters')
   */
  protected downloadReport(
    endpoint: string,
    filename: string,
    format: ReportFormat,
    scope: ReportScope,
    filters?: Record<string, any>
  ): void {
    const params: Record<string, any> = {};
    const activeFilters: string[] = [];

    if (scope === 'all') {
      params['exportAll'] = true;
      if (filters?.['employeeId'] !== null && filters?.['employeeId'] !== undefined) {
        params['employeeId'] = filters['employeeId'];
      }
      if (filters?.['departmentId'] !== null && filters?.['departmentId'] !== undefined) {
        params['departmentId'] = filters['departmentId'];
      }
    } else if (scope === 'with-filters' && filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params[key] = filters[key];
          // Track active filters for filename
          if (key !== 'employeeId' && key !== 'departmentId') {
            activeFilters.push(`${key}=${filters[key]}`);
          }
        }
      });
    }

    // Build enhanced filename with filters
    let enhancedFilename = filename;
    if (activeFilters.length > 0) {
      const ext = filename.split('.').pop();
      const base = filename.replace(`.${ext}`, '');
      const timestamp = new Date().toISOString().slice(0, 10);
      enhancedFilename = `${base}_${activeFilters.join('_')}_${timestamp}.${ext}`;
    }

    this.apiService.getBlob(endpoint, params).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = enhancedFilename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () =>
        this.snackbarService.error(
          `Failed to download ${format.toUpperCase()} report`
        ),
    });
  }

  /**
   * Extract initials from name (e.g., "John Doe" -> "JD")
   * Used for avatar badges
   */
  protected getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Format date for display
   * Handles multiple input formats: string, Date, array, null
   */
  protected formatDate(
    date: string | Date | number[] | null | undefined
  ): string {
    if (!date) return '';

    // Handle array format (from backend sometimes)
    if (Array.isArray(date)) {
      const [year, month, day, hour = 0, minute = 0] = date;
      return new Date(year, month - 1, day, hour, minute).toLocaleDateString(
        'en-US',
        { year: 'numeric', month: '2-digit', day: '2-digit' }
      );
    }

    // Handle Date and string formats
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  /**
   * Format datetime (date + time) for display
   */
  protected formatDateTime(date: string | Date | null | undefined): string {
    if (!date) return '';

    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Check if user has specific role
   */
  protected hasRole(role: UserRoleEnum | string): boolean {
    return this.userService.currentUser()?.role === role;
  }

  /**
   * Check if user is admin or department responsible
   */
  protected isManagerial(): boolean {
    const userRole = this.userService.currentUser()?.role;
    return (
      userRole === 'ADMIN' ||
      userRole === 'DEPT_RESPONSIBLE'
    );
  }
}
