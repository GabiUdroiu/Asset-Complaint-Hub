export type AssetStatus = 'active' | 'inactive' | 'maintenance';

export interface Asset {
    id: string | number;
    name: string;
    serialNumber: string;
    category: string;
    status: AssetStatus;
    owner: string;
    lastUpdated?: string;
    employeeId?: number;
}
