import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { ListCacheService } from './list-cache.service';
import { Request } from '../models';

export interface PaginationParams {
    page?: number;
    size?: number;
}

export interface RequestFilters {
    status?: string;
    category?: string;
    search?: string;
    employeeId?: number;
    departmentId?: number;
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
    private listCache = inject(ListCacheService);

    private readonly listCachePrefix = 'requests';

    private buildListCacheKey(url: string): string {
        return url;
    }

    private invalidateListCache(): void {
        this.listCache.invalidateByPrefix(this.listCachePrefix);
    }

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
        const cachedResponse = this.listCache.get<ApiResponse<RequestListResponse>>(cacheKey);
        if (cachedResponse) {
            return of(cachedResponse);
        }

        return this.apiService.get<RequestListResponse>(url).pipe(
            tap((response) => this.listCache.set(cacheKey, response)),
        );
    }

    getRequest(id: string | number): Observable<ApiResponse<Request>> {
        return this.apiService.get<Request>(`requests/${id}`);
    }

    createRequest(request: Partial<Request>): Observable<ApiResponse<Request>> {
        return this.apiService.post<Request>('requests', request).pipe(
            tap(() => this.invalidateListCache()),
        );
    }

    updateRequest(
        id: string | number,
        request: Partial<Request>,
    ): Observable<ApiResponse<Request>> {
        return this.apiService.put<Request>(`requests/${id}`, request).pipe(
            tap(() => this.invalidateListCache()),
        );
    }

    deleteRequest(id: string | number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(`requests/${id}`).pipe(
            tap(() => this.invalidateListCache()),
        );
    }
}
