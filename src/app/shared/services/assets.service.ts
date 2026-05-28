import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { ListCacheService } from './list-cache.service';
import { Asset, AssetStatus } from '../models';

export interface PaginationParams {
    page?: number;
    size?: number;
}

export interface AssetFilters {
    status?: AssetStatus;
    category?: string;
    search?: string;
    employeeId?: number;
    departmentId?: number;
}

export interface AssetListResponse {
    items: Asset[];
    total: number;
    page: number;
    size: number;
}

@Injectable({
    providedIn: 'root',
})
export class AssetsService {
    private apiService = inject(ApiService);
    private listCache = inject(ListCacheService);

    private readonly listCachePrefix = 'assets';

    private buildListCacheKey(url: string): string {
        return url;
    }

    private invalidateListCache(): void {
        this.listCache.invalidateByPrefix(this.listCachePrefix);
    }

    getAssets(
        pagination?: PaginationParams,
        filters?: AssetFilters,
    ): Observable<ApiResponse<AssetListResponse>> {
        let url = 'assets';
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
        const cachedResponse = this.listCache.get<ApiResponse<AssetListResponse>>(cacheKey);
        if (cachedResponse) {
            return of(cachedResponse);
        }

        return this.apiService.get<AssetListResponse>(url).pipe(
            tap((response) => this.listCache.set(cacheKey, response)),
        );
    }

    getAsset(id: string | number): Observable<ApiResponse<Asset>> {
        return this.apiService.get<Asset>(`assets/${id}`);
    }

    createAsset(asset: Partial<Asset>): Observable<ApiResponse<Asset>> {
        return this.apiService.post<Asset>('assets', asset).pipe(
            tap(() => this.invalidateListCache()),
        );
    }

    updateAsset(id: string | number, asset: Partial<Asset>): Observable<ApiResponse<Asset>> {
        return this.apiService.put<Asset>(`assets/${id}`, asset).pipe(
            tap(() => this.invalidateListCache()),
        );
    }

    deleteAsset(id: string | number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(`assets/${id}`).pipe(
            tap(() => this.invalidateListCache()),
        );
    }
}
