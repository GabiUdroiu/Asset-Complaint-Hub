export type UserRole = 'USER' | 'DEPT_RESPONSIBLE' | 'ADMIN';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    departmentId?: number;
    department?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
    USER: 'Employee',
    DEPT_RESPONSIBLE: 'Department Responsible',
    ADMIN: 'Administrator',
};

export const ROLE_COLORS: Record<UserRole, string> = {
    USER: 'primary',
    DEPT_RESPONSIBLE: 'accent',
    ADMIN: 'warn',
};
