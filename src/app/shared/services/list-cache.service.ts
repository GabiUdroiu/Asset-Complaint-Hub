import { Injectable, signal } from '@angular/core';

interface CachedEntry<T> {
    value: T;
    storedAt: number;
}

@Injectable({
    providedIn: 'root',
})
export class ListCacheService {
    private readonly cache = signal<Record<string, CachedEntry<unknown>>>({});
    private readonly defaultTtlMs = 2 * 60 * 1000;

    get<T>(key: string, ttlMs: number = this.defaultTtlMs): T | null {
        const entry = this.cache()[key] as CachedEntry<T> | undefined;
        if (!entry) {
            return null;
        }

        if (Date.now() - entry.storedAt > ttlMs) {
            this.invalidate(key);
            return null;
        }

        return entry.value;
    }

    set<T>(key: string, value: T): void {
        this.cache.update((current) => ({
            ...current,
            [key]: {
                value,
                storedAt: Date.now(),
            },
        }));
    }

    invalidate(key: string): void {
        this.cache.update((current) => {
            if (!current[key]) {
                return current;
            }

            const next = { ...current };
            delete next[key];
            return next;
        });
    }

    invalidateByPrefix(prefix: string): void {
        this.cache.update((current) => {
            const next = { ...current };
            let changed = false;

            Object.keys(next).forEach((key) => {
                if (key.startsWith(prefix)) {
                    delete next[key];
                    changed = true;
                }
            });

            return changed ? next : current;
        });
    }

    clear(): void {
        this.cache.set({});
    }
}