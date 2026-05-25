export type RequestStatus = 'active' | 'inactive' | 'maintenance';

export interface Request {
    id: string | number;
    name: string;
    serialNumber: string;
    category: string;
    status: RequestStatus;
    owner: string;
    lastUpdated?: string;
    employeeId?: number;
}
