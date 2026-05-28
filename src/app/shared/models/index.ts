// ============ ENUMS ============
export enum UserRoleEnum {
  USER = 'USER',
  DEPT_RESPONSIBLE = 'DEPT_RESPONSIBLE',
  ADMIN = 'ADMIN',
}

export enum ComplaintStatusEnum {
  NEW = 'NEW',
  IN_REVIEW = 'IN_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

export enum AssetStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

// ============ TYPES (Backward Compatibility) ============
export type UserRole = UserRoleEnum | string;
export type ComplaintStatus = ComplaintStatusEnum | string;
export type AssetStatus = AssetStatusEnum | string;

// ============ ROLE LABELS & COLORS ============
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

// ============ BASE INTERFACES ============
export interface BaseEntity {
  id: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// ============ USER MODELS ============
export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  departmentId?: number;
  department?: string;
}

export type EmployeeDTO = User;

// ============ COMPLAINT MODELS ============
export interface Complaint extends BaseEntity {
  title: string;
  description: string;
  status: ComplaintStatus;
  assetId?: number;
  employeeId?: number;
  employeeName?: string;
  departmentName?: string;
  acceptedBy?: number;
  acceptedByName?: string;
  acceptedAt?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lockedById?: number;
  lockedByName?: string;
  lockedAt?: string | Date;
  version?: number;
}

export interface ComplaintComment extends BaseEntity {
  complaintId: number;
  employeeId: number;
  employeeName?: string;
  message: string;
  text?: string;
}

export interface ComplaintWorkflow extends BaseEntity {
  complaintId: number;
  employeeId: number;
  employeeName?: string;
  oldStatus?: string;
  currentStatus: string;
  changedAt: string | Date;
}

// Alias for backward compatibility
export type ComplaintDTO = Complaint;
export type CommentDTO = ComplaintComment;
export type WorkflowDTO = ComplaintWorkflow;

// ============ ASSET MODELS ============
export interface Asset extends BaseEntity {
  name: string;
  serialNumber: string;
  category: string;
  status: AssetStatus;
  owner?: string;
  lastUpdated?: string;
  employeeId?: number;
  employeeName?: string;
  departmentId?: number;
}

// Alias for backward compatibility
export type AssetDTO = Asset;

// ============ DEPARTMENT MODELS ============
export interface Department extends BaseEntity {
  name: string;
  responsibleEmployeeId?: number;
  responsibleEmployeeName?: string;
}

export type DepartmentDTO = Department;

// ============ REQUEST/DEMAND MODELS ============
export interface Request extends BaseEntity {
  title: string;
  description: string;
  status: string;
  priority?: string;
  assetId?: number | null;
  employeeId?: number;
  employeeName?: string;
  departmentId?: number;
  departmentName?: string;
  acceptedBy?: number;
  acceptedByName?: string;
  acceptedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lockedById?: number;
  lockedByName?: string;
  lockedAt?: string | Date;
  version?: number;
}

export type RequestDTO = Request;

export interface Demand extends BaseEntity {
  title?: string;
  description: string;
  type?: string;
  status: string;
  assignedTo?: number;
  employeeId?: number;
  employeeName?: string;
  departmentName?: string;
  acceptedBy?: number;
  acceptedByName?: string;
  createdAt?: string | Date;
}

// ============ TASK/ASSIGNMENT MODELS ============
export interface AssignmentTask {
  id?: number;
  itemType: string;
  itemId: number;
  acceptedBy: number;
  itemTitle?: string;
  acceptedByName?: string;
  acceptedAt?: Date;
  status?: string;
}

// ============ API RESPONSE MODELS ============
export interface ApiErrorResponse {
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

// ============ UTILITY TYPES ============
export type ReportFormat = 'pdf' | 'csv';
export type ReportScope = 'with-filters' | 'all';

export interface SelectOption {
  value: string;
  label: string;
}

export interface PaginationParams {
  page: number;
  size: number;
}

export interface Filters {
  [key: string]: string | number | undefined | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export interface PaginatedApiResponse<T> {
  data?: PaginatedResponse<T>;
  message?: string;
}

// ============ AUTH MODELS ============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  departmentId: number;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

// Re-export from individual models for backward compatibility
export * from './asset.model';
export * from './request.model';
export * from './demand.model';
export * from './complaint.model';
export * from './user.model';
