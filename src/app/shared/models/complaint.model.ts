export type ComplaintStatus = 'NEW' | 'IN_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';

export interface Complaint {
    id: string | number;
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
    createdAt?: string;
    updatedAt?: string;
    version?: number;
    lockedById?: number;
    lockedByName?: string;
    lockedAt?: string;
}
