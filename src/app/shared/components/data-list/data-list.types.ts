import { Observable } from 'rxjs';

export interface SelectOption {
    value: string;
    label: string;
}

export interface ActionDef<T = any> {
    icon: string;
    tooltip: string;
    color?: 'primary' | 'accent' | 'warn';
    routerLink?: (row: T) => string[];
    click?: (row: T) => void;
}

export interface ColumnDef<T = any> {
    key: string;
    header: string;
    cell?: (row: T) => string;
    htmlCell?: (row: T) => string;
    isStatus?: boolean;
    isActions?: boolean;
    actions?: ActionDef<T>[];
}

export type LoadFn<T = any> = (
    pagination: { page: number; size: number },
    filters: { search?: string; status?: string; category?: string; employeeId?: number; departmentId?: number },
) => Observable<{ items: T[]; total: number }>;
