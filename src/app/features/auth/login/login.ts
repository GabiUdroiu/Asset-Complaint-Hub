import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, LoginRequest } from '../../../shared/services/auth.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';

@Component({
    selector: 'app-login',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './login.html',
    styleUrls: ['../auth.scss'],
})
export class LoginComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    authService = inject(AuthService);
    private snackbarService = inject(SnackbarService);

    ngOnInit() {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/home']);
        }
    }

    showPassword = signal(false);
    loading = signal(false);

    loginForm: FormGroup;

    // Demo credentials for easy testing
    demoUsers = [
        { email: 'john.doe@draxlmaier.com', password: 'password123', label: 'Employee' },
        { email: 'jane.manager@draxlmaier.com', password: 'password123', label: 'Responsible' },
        { email: 'admin@draxlmaier.com', password: 'password123', label: 'Admin' },
    ];

    constructor() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    onLogin() {
        if (this.loginForm.invalid) {
            this.snackbarService.error('Please enter valid email and password');
            return;
        }

        this.loading.set(true);
        const credentials: LoginRequest = this.loginForm.value;

        this.authService.login(credentials).subscribe({
            next: () => {
                this.snackbarService.success(
                    `Welcome, ${this.authService.currentUser()?.name}!`
                );
                this.loading.set(false);
                this.router.navigate(['/home']);
            },
            error: (error) => {
                this.loading.set(false);
                const message = error?.error?.message || 'Login failed. Please try again.';
                this.snackbarService.error(message);
            },
        });
    }

    quickLogin(email: string) {
        this.loginForm.patchValue({ email, password: 'password123' });
        setTimeout(() => this.onLogin(), 100);
    }

    togglePasswordVisibility() {
        this.showPassword.set(!this.showPassword());
    }
}
