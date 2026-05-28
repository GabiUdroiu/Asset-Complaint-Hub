import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { env } from '../../enviroment';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private readonly baseUrl = env.apiUrl;

    private readonly http = inject(HttpClient);

    get<T>(endpoint: string) {
        return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`);
    }

    post<T>(endpoint: string, body: any) {
        return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body);
    }

    put<T>(endpoint: string, body: any) {
        return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body);
    }

    delete<T>(endpoint: string) {
        return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`);
    }

    getBlob(endpoint: string, params?: any): Observable<Blob> {
        if (params) {
            const queryParams = new URLSearchParams();
            Object.keys(params).forEach((key) => {
                if (params[key] !== undefined && params[key] !== null) {
                    queryParams.append(key, params[key]);
                }
            });
            const queryString = queryParams.toString();
            endpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
        }
        return this.http.get(`${this.baseUrl}/${endpoint}`, {
            responseType: 'blob',
        }) as Observable<Blob>;
    }
}
