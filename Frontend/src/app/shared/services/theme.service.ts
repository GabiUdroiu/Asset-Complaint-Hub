import { Injectable, effect, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private theme = signal<Theme>(this.getInitialTheme());

    constructor() {
        effect(() => {
            const theme = this.theme();
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            localStorage.setItem('theme', theme);
        });
    }

    private getInitialTheme(): Theme {
        const stored = localStorage.getItem('theme') as Theme | null;
        if (stored) {
            return stored;
        }
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    }

    getTheme() {
        return this.theme.asReadonly();
    }

    setTheme(theme: Theme) {
        this.theme.set(theme);
    }

    toggleTheme() {
        this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
    }
}
