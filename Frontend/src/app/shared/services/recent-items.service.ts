import { Injectable } from '@angular/core';

export interface RecentItem {
    id: number;
    type: 'complaint' | 'request';
    title: string;
    timestamp: number;
    employeeId?: number;
}

@Injectable({
    providedIn: 'root',
})
export class RecentItemsService {
    private readonly STORAGE_KEY = 'recent_items';
    private readonly MAX_ITEMS = 10;

    addItem(item: Omit<RecentItem, 'timestamp'>) {
        const items = this.getItems();
        const filtered = items.filter((i) => !(i.id === item.id && i.type === item.type));
        const newItem: RecentItem = { ...item, timestamp: Date.now() };
        const updated = [newItem, ...filtered].slice(0, this.MAX_ITEMS);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    }

    getItems(): RecentItem[] {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    removeItem(id: number, type: 'complaint' | 'request') {
        const items = this.getItems();
        const filtered = items.filter((i) => !(i.id === id && i.type === type));
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    }

    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
