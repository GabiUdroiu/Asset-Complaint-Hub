import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ListCacheService } from './list-cache.service';

export interface Department {
    id: number;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class DepartmentService {
    private apiService = inject(ApiService);
    private listCache = inject(ListCacheService);

    private readonly cacheKey = 'departments';

    getDepartments(): Observable<Department[]> {
        const cachedDepartments = this.listCache.get<Department[]>(this.cacheKey);
        if (cachedDepartments) {
            return of(cachedDepartments);
        }

        return this.apiService.get<any>('departments').pipe(
            map(response => {
                const departments = response.data?.items || response.data || [];
                return Array.isArray(departments) ? departments : [];
            }),
            tap((departments) => this.listCache.set(this.cacheKey, departments)),
            catchError(() => of([]))
        );
    }
}
