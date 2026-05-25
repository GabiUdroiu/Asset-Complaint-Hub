import { Injectable, signal, computed, inject, Component } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../../shared/models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private router = inject(Router);
    private matDialog = inject(MatDialog);
    private authService = inject(AuthService);

    // Map AuthService role to UserService role
    currentUser = computed(() => {
        const authUser = this.authService.currentUser();
        if (!authUser) return null;

        return {
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            role: this.mapAuthRoleToUserRole(authUser.role),
            department: authUser.department,
        } as User;
    });

    isLoggedIn = computed(() => this.authService.isAuthenticated());
    isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
    isResponsible = computed(() =>
        ['ADMIN', 'DEPT_RESPONSIBLE'].includes(this.currentUser()?.role || ''),
    );

    viewMode = signal<'personal' | 'support'>('personal');
    isInSupportMode = computed(() => this.viewMode() === 'support');

    constructor() {
        this.initializeViewMode();
    }

    /**
     * Load view mode from localStorage
     */
    private initializeViewMode() {
        const storedViewMode = localStorage.getItem('viewMode') as 'personal' | 'support' | null;
        if (storedViewMode) {
            this.viewMode.set(storedViewMode);
        } else {
            // Ensure normal employees always start in personal view
            if (this.currentUser()?.role === 'USER') {
                this.viewMode.set('personal');
            }
        }
    }

    /**
     * Map AuthService role to UserService role
     */
    private mapAuthRoleToUserRole(authRole: string): UserRole {
        switch (authRole) {
            case 'EMPLOYEE':
            case 'USER':
                return 'USER';
            case 'DEPT_RESPONSIBLE':
                return 'DEPT_RESPONSIBLE';
            case 'ADMIN':
                return 'ADMIN';
            default:
                return 'USER';
        }
    }

    /**
     * Logout
     */
    logout() {
        this.authService.logout();
    }

    /**
     * Toggle between personal and support view modes (only for non-employees)
     */
    toggleViewMode() {
        if (!this.isResponsible()) return;

        const dialogRef = this.matDialog.open(ViewModeSwitchDialog, {
            disableClose: true,
            backdropClass: 'view-mode-backdrop',
        });

        setTimeout(() => {
            const newMode = this.viewMode() === 'personal' ? 'support' : 'personal';
            this.viewMode.set(newMode);
            localStorage.setItem('viewMode', newMode);
            dialogRef.close();

            if (newMode === 'personal') {
                this.router.navigate(['/home']);
            }
        }, 600);
    }
}

@Component({
    selector: 'view-mode-switch-dialog',
    template: `
        <div class="view-mode-dialog">
            <mat-spinner diameter="60"></mat-spinner>
            <p>Switching view...</p>
        </div>
    `,
    styles: [
        `
            .view-mode-dialog {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                padding: 40px;
                text-align: center;
            }
            p {
                margin: 0;
                font-weight: 500;
            }
        `,
    ],
    imports: [MatProgressSpinnerModule],
})
export class ViewModeSwitchDialog {}
