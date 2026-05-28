import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { ListCacheService } from './list-cache.service';

export interface PaginationParams {
    page?: number;
    size?: number;
}

export interface ComplaintFilters {
    status?: string;
    search?: string;
    employeeId?: number;
    departmentId?: number;
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
    acceptedByName?: string;
    acceptedAt?: string;
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
    private listCache = inject(ListCacheService);

    private readonly listCachePrefix = 'complaints';

    private buildListCacheKey(url: string): string {
        return url;
    }

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
        if (filters?.departmentId !== undefined) {
            params.append('departmentId', filters.departmentId.toString());
        }

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        const cacheKey = this.buildListCacheKey(url);
        const cachedResponse = this.listCache.get<ApiResponse<ComplaintListResponse>>(cacheKey);
        if (cachedResponse) {
            return of(cachedResponse);
        }

        return this.apiService.get<ComplaintListResponse>(url).pipe(
            tap((response) => this.listCache.set(cacheKey, response)),
        );
    }

    getComplaint(id: string | number): Observable<ApiResponse<ComplaintDTO>> {
        return this.apiService.get<ComplaintDTO>(`complaints/${id}`);
    }
}
