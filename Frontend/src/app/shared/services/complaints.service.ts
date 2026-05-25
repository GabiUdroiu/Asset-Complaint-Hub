import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface PaginationParams {
    page?: number;
    size?: number;
}

export interface ComplaintFilters {
    status?: string;
    search?: string;
    employeeId?: number;
}

export interface ComplaintDTO {
    id: number;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    assetId: number;
    employeeId: number;
    employeeName?: string;
    departmentName?: string;
}

export interface ComplaintListResponse {
    items: ComplaintDTO[];
    total: number;
    page: number;
    size: number;
}

@Injectable({
    providedIn: 'root',
})
export class ComplaintsService {
    private apiService = inject(ApiService);

    getComplaints(
        pagination?: PaginationParams,
        filters?: ComplaintFilters,
    ): Observable<ApiResponse<ComplaintListResponse>> {
        let url = 'complaints';
        const params = new URLSearchParams();

        if (pagination?.page !== undefined) {
            params.append('page', pagination.page.toString());
        }
        if (pagination?.size !== undefined) {
            params.append('size', pagination.size.toString());
        }

        if (filters?.status) {
            params.append('status', filters.status);
        }
        if (filters?.search) {
            params.append('search', filters.search);
        }
        if (filters?.employeeId !== undefined) {
            params.append('employeeId', filters.employeeId.toString());
        }

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        return this.apiService.get<ComplaintListResponse>(url);
    }

    getComplaint(id: string | number): Observable<ApiResponse<ComplaintDTO>> {
        return this.apiService.get<ComplaintDTO>(`complaints/${id}`);
    }
}
