import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Announcement {
    id: number;
    title: string;
    description: string;
    date?: string | Date;
    announcementDate?: string | Date;
    createdAt: string;
    updatedAt: string;
}

@Injectable({
    providedIn: 'root',
})
export class AnnouncementService {
    private apiService = inject(ApiService);
    private announcementsSubject = new BehaviorSubject<Announcement[]>([]);
    public announcements$ = this.announcementsSubject.asObservable();

    constructor() {
        this.loadAnnouncements();
    }

    loadAnnouncements(): void {
        this.apiService.get<any>('announcements?page=0&size=10')
            .pipe(
                map((response) => {
                    const items = response.data?.items ?? response.data ?? [];
                    const arr = Array.isArray(items) ? items : [];
                    return arr.map((item: any) => ({
                        id: item.id,
                        title: item.title || '',
                        description: item.description || '',
                        date: this.parseDate(item.date || item.announcementDate || item.createdAt),
                        announcementDate: item.announcementDate,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                    }));
                })
            )
            .subscribe({
                next: (announcements) => {
                    this.announcementsSubject.next(announcements);
                },
                error: () => {
                    this.announcementsSubject.next([]);
                },
            });
    }

    private parseDate(dateValue: any): Date | string {
        if (!dateValue) return new Date();
        if (typeof dateValue === 'string') {
            return new Date(dateValue);
        }
        if (Array.isArray(dateValue)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
            return new Date(year, month - 1, day, hour, minute, second);
        }
        if (dateValue instanceof Date) return dateValue;
        return new Date();
    }

    getRecent(limit: number = 5): Observable<Announcement[]> {
        return this.apiService.get<any>(`announcements/recent?limit=${limit}`)
            .pipe(
                map((response) => {
                    const items = response.data?.items ?? response.data ?? [];
                    return Array.isArray(items) ? items : [];
                })
            );
    }
}
