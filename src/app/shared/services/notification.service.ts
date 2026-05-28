import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';
import { UserService } from '../../core/services/user.service';
import { ApiService } from './api.service';

export interface Notification {
    id: string;
    type: 'complaint_updated' | 'request_updated' | 'announcement' | 'system';
    message: string;
    timestamp: Date;
    read: boolean;
    data?: any;
}

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private snackbarService = inject(SnackbarService);
    private userService = inject(UserService);
    private apiService = inject(ApiService);

    private notificationSubject = new BehaviorSubject<Notification[]>([]);
    public notifications$ = this.notificationSubject.asObservable();

    private eventSource: EventSource | null = null;

    subscribe(): void {
        const userId = this.userService.currentUser()?.id;
        if (!userId) return;

        this.loadPersisted(userId);

        if (this.eventSource) {
            this.eventSource.close();
        }

        this.eventSource = new EventSource(`http://localhost:8080/backend/api/notifications/subscribe/${userId}`);

        this.eventSource.addEventListener('complaint_updated', (event: MessageEvent) => {
            this.handleIncoming({
                type: 'complaint_updated',
                message: event.data,
            }, userId);
        });

        this.eventSource.addEventListener('request_updated', (event: MessageEvent) => {
            this.handleIncoming({
                type: 'request_updated',
                message: event.data,
            }, userId);
        });

        this.eventSource.addEventListener('announcement', (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                this.handleIncoming({
                    type: 'announcement',
                    message: data.title,
                    data,
                }, userId);
            } catch (e) {
                console.error('Failed to parse announcement notification', e);
            }
        });

        this.eventSource.addEventListener('system', (event: MessageEvent) => {
            this.handleIncoming({
                type: 'system',
                message: event.data,
            }, userId);
        });

        this.eventSource.onerror = () => {
            this.eventSource?.close();
            this.eventSource = null;
            setTimeout(() => this.subscribe(), 5000);
        };
    }

    unsubscribe(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    markAsRead(id: string): void {
        this.apiService.put(`notifications/${id}/read`, {}).subscribe();
        const updated = this.notificationSubject.value.map((n) =>
            n.id === id ? { ...n, read: true } : n
        );
        this.notificationSubject.next(updated);
    }

    markAllAsRead(): void {
        const userId = this.userService.currentUser()?.id;
        if (!userId) return;
        this.apiService.put(`notifications/user/${userId}/read-all`, {}).subscribe();
        const updated = this.notificationSubject.value.map((n) => ({ ...n, read: true }));
        this.notificationSubject.next(updated);
    }

    dismiss(id: string): void {
        this.apiService.delete(`notifications/${id}`).subscribe();
        const updated = this.notificationSubject.value.filter((n) => n.id !== id);
        this.notificationSubject.next(updated);
    }

    dismissAll(): void {
        const userId = this.userService.currentUser()?.id;
        if (!userId) return;
        this.apiService.delete(`notifications/user/${userId}`).subscribe();
        this.notificationSubject.next([]);
    }

    getUnreadCount(): Observable<number> {
        return this.notifications$.pipe(
            map(notifications => notifications.filter((n) => !n.read).length)
        );
    }

    private loadPersisted(userId: number): void {
        this.apiService.get<any[]>(`notifications/user/${userId}`).subscribe({
            next: (response: any) => {
                const items: any[] = Array.isArray(response) ? response : (response?.data ?? []);
                const notifications: Notification[] = items.map((n: any) => ({
                    id: String(n.id),
                    type: n.type,
                    message: n.message,
                    timestamp: new Date(n.createdAt),
                    read: n.read,
                    data: n.data ? this.tryParse(n.data) : undefined,
                }));
                this.notificationSubject.next(notifications);
            },
            error: () => {},
        });
    }

    private handleIncoming(
        partial: { type: Notification['type']; message: string; data?: any },
        userId: number
    ): void {
        this.loadPersisted(userId);

        if (partial.type === 'announcement') {
            this.snackbarService.success(partial.message);
        } else {
            this.snackbarService.info(partial.message);
        }
    }

    private tryParse(value: string): any {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }
}
