import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    name: string;
    password: string;
    department?: string;
}

export interface AuthResponse {
    token: string;
    refreshToken?: string;
    user: UserDTO;
    expiresIn: number;
}

export interface UserDTO {
    id: number;
    email: string;
    name: string;
    department: string;
    role: 'EMPLOYEE' | 'DEPT_RESPONSIBLE' | 'ADMIN';
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiService = inject(ApiService);
    private router = inject(Router);
    private http = inject(HttpClient);

    // Signals
    currentUser = signal<UserDTO | null>(null);
    token = signal<string | null>(null);
    refreshToken = signal<string | null>(null);
    isLoading = signal(false);
    error = signal<string | null>(null);

    // Computed signals
    isAuthenticated = computed(() => this.token() !== null);
    isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
    isResponsible = computed(
        () =>
            this.currentUser()?.role === 'ADMIN' ||
            this.currentUser()?.role === 'DEPT_RESPONSIBLE'
    );

    // Subject for token expiry
    private tokenExpiry$ = new BehaviorSubject<number | null>(null);

    constructor() {
        this.initializeFromStorage();
        this.setupTokenRefreshTimer();
    }

    /**
     * Login with email and password
     */
    login(credentials: LoginRequest): Observable<AuthResponse> {
        this.isLoading.set(true);
        this.error.set(null);

        return this.apiService.post<AuthResponse>('auth/login', credentials).pipe(
            tap((apiResponse: any) => {
                const response = apiResponse.data;
                this.token.set(response.token);
                this.refreshToken.set(response.refreshToken || null);
                this.currentUser.set(response.user);
                this.storeAuthData(response);
                this.setTokenExpiry(response.expiresIn);
                this.isLoading.set(false);
            }),
            catchError((error) => {
                this.error.set(error?.error?.message || 'Login failed');
                this.isLoading.set(false);
                return throwError(() => error);
            })
        );
    }

    /**
     * Register new user
     */
    register(data: RegisterRequest): Observable<AuthResponse> {
        this.isLoading.set(true);
        this.error.set(null);

        return this.apiService.post<AuthResponse>('auth/register', data).pipe(
            tap((apiResponse: any) => {
                const response = apiResponse.data;
                this.token.set(response.token);
                this.currentUser.set(response.user);
                this.storeAuthData(response);
                this.setTokenExpiry(response.expiresIn);
                this.isLoading.set(false);
            }),
            catchError((error) => {
                this.error.set(error?.error?.message || 'Registration failed');
                this.isLoading.set(false);
                return throwError(() => error);
            })
        );
    }

    /**
     * Logout
     */
    logout(): void {
        this.token.set(null);
        this.refreshToken.set(null);
        this.currentUser.set(null);
        this.error.set(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('tokenExpiry');
        this.router.navigate(['/login']);
    }

    /**
     * Refresh access token
     */
    refreshAccessToken(): Observable<AuthResponse> {
        const refreshToken = this.refreshToken();
        if (!refreshToken) {
            this.logout();
            return throwError(() => new Error('No refresh token available'));
        }

        const request: RefreshTokenRequest = { refreshToken };

        return this.apiService.post<AuthResponse>('auth/refresh', request).pipe(
            tap((apiResponse: any) => {
                const response = apiResponse.data;
                this.token.set(response.token);
                if (response.refreshToken) {
                    this.refreshToken.set(response.refreshToken);
                }
                localStorage.setItem('authToken', response.token);
                if (response.refreshToken) {
                    localStorage.setItem('refreshToken', response.refreshToken);
                }
                this.setTokenExpiry(response.expiresIn);
            }),
            catchError((error) => {
                this.logout();
                return throwError(() => error);
            })
        );
    }

    /**
     * Get current auth token
     */
    getToken(): string | null {
        return this.token();
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(): boolean {
        const expiry = this.tokenExpiry$.value;
        if (!expiry) return false;
        return Date.now() > expiry;
    }

    /**
     * Initialize auth state from localStorage
     */
    private initializeFromStorage(): void {
        const token = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const user = localStorage.getItem('currentUser');
        const expiry = localStorage.getItem('tokenExpiry');

        if (token && user) {
            this.token.set(token);
            this.refreshToken.set(refreshToken);
            this.currentUser.set(JSON.parse(user));
            if (expiry) {
                this.tokenExpiry$.next(parseInt(expiry, 10));
            }
        }
    }

    /**
     * Store authentication data in localStorage
     */
    private storeAuthData(response: AuthResponse): void {
        localStorage.setItem('authToken', response.token);
        if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
        }
        localStorage.setItem('currentUser', JSON.stringify(response.user));
    }

    /**
     * Set token expiry time
     */
    private setTokenExpiry(expiresIn: number): void {
        const expiry = Date.now() + expiresIn;
        this.tokenExpiry$.next(expiry);
        localStorage.setItem('tokenExpiry', expiry.toString());
    }

    /**
     * Setup automatic token refresh before expiry
     */
    private setupTokenRefreshTimer(): void {
        this.tokenExpiry$.subscribe((expiry) => {
            if (!expiry) return;

            // Refresh token 5 minutes before expiry
            const refreshTime = expiry - Date.now() - 300000;

            if (refreshTime > 0) {
                setTimeout(() => {
                    if (this.isAuthenticated() && !this.isTokenExpired()) {
                        this.refreshAccessToken().subscribe({
                            error: () => this.logout()
                        });
                    }
                }, refreshTime);
            }
        });
    }
}
