export type DemandStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type DemandPriority = 'low' | 'medium' | 'high';

export interface Demand {
    id: string | number;
    title: string;
    description: string;
    status: DemandStatus;
    priority: DemandPriority;
    createdAt: string;
    dueDate?: string;
    approvedBy?: string;
    approvedDate?: string;
    employeeId?: number;
    employeeName?: string;
    departmentName?: string;
}
