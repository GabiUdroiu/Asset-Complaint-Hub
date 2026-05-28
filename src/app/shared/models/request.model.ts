export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface Request {
    id: string | number;
    title: string;
    description: string;
    status: RequestStatus;
    assetId?: number | null;
    employeeId?: number;
    employeeName?: string;
    departmentName?: string;
    acceptedBy?: number;
    acceptedByName?: string;
    acceptedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    version?: number;
    lockedById?: number;
    lockedByName?: string;
    lockedAt?: string;
}
