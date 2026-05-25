import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';
import { Request, RequestStatus } from '../models';

export interface PaginationParams {
    page?: number;
    size?: number;
}

export interface RequestFilters {
    status?: RequestStatus;
    category?: string;
    search?: string;
}

export interface RequestListResponse {
    items: Request[];
    total: number;
    page: number;
    size: number;
}

@Injectable({
    providedIn: 'root',
})
export class RequestsService {
    private apiService = inject(ApiService);

    getRequests(
        pagination?: PaginationParams,
        filters?: RequestFilters,
    ): Observable<ApiResponse<RequestListResponse>> {
        let url = 'requests';
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
        if (filters?.category) {
            params.append('category', filters.category);
        }
        if (filters?.search) {
            params.append('search', filters.search);
        }

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        return this.apiService.get<RequestListResponse>(url);
    }

    getRequest(id: string | number): Observable<ApiResponse<Request>> {
        return this.apiService.get<Request>(`requests/${id}`);
    }

    createRequest(request: Request): Observable<ApiResponse<Request>> {
        return this.apiService.post<Request>('requests', request);
    }

    updateRequest(
        id: string | number,
        request: Partial<Request>,
    ): Observable<ApiResponse<Request>> {
        return this.apiService.put<Request>(`requests/${id}`, request);
    }

    deleteRequest(id: string | number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(`requests/${id}`);
    }
}
