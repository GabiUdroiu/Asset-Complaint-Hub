export type ComplaintStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Complaint {
    id: string | number;
    title: string;
    description: string;
    category: string;
    status: ComplaintStatus;
    priority: ComplaintPriority;
    createdDate: string;
    resolvedDate?: string;
    assignedTo?: string;
    resolution?: string;
    progress: number;
    assetId?: number;
    employeeId?: number;
}
