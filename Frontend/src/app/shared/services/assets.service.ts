import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';
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

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        return this.apiService.get<AssetListResponse>(url);
    }

    getAsset(id: string | number): Observable<ApiResponse<Asset>> {
        return this.apiService.get<Asset>(`assets/${id}`);
    }

    createAsset(asset: Asset): Observable<ApiResponse<Asset>> {
        return this.apiService.post<Asset>('assets', asset);
    }

    updateAsset(id: string | number, asset: Partial<Asset>): Observable<ApiResponse<Asset>> {
        return this.apiService.put<Asset>(`assets/${id}`, asset);
    }

    deleteAsset(id: string | number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(`assets/${id}`);
    }
}
