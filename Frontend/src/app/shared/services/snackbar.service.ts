import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type SnackBarType = 'success' | 'error' | 'info';

export interface SnackBarItem {
    id: string;
    message: string;
    type: SnackBarType;
}

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {
    private snackbars$ = new BehaviorSubject<SnackBarItem[]>([]);
    snackbars = this.snackbars$.asObservable();
    private idCounter = 0;
    private readonly DURATION = 5000;

    open(message: string, type: SnackBarType = 'info') {
        const id = `snackbar-${++this.idCounter}`;
        const item: SnackBarItem = { id, message, type };

        const current = this.snackbars$.value;
        this.snackbars$.next([...current, item]);

        setTimeout(() => this.close(id), this.DURATION);
    }

    close(id: string) {
        const current = this.snackbars$.value;
        this.snackbars$.next(current.filter((s) => s.id !== id));
    }

    success(message: string) {
        this.open(message, 'success');
    }

    error(message: string) {
        this.open(message, 'error');
    }

    info(message: string) {
        this.open(message, 'info');
    }
}
