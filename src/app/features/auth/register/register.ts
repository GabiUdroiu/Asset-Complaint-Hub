import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../core/services/user.service';
import { AuthService, RegisterRequest } from '../../../shared/services/auth.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';

@Component({
    selector: 'app-register',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
    ],
    templateUrl: './register.html',
    styleUrls: ['../auth.scss'],
})
export class RegisterComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private authService = inject(AuthService);
    private snackbarService = inject(SnackbarService);

    ngOnInit() {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/home']);
        }
    }

    showPassword = signal(false);
    loading = signal(false);

    registerForm: FormGroup;

    departments = ['IT', 'HR', 'Operations', 'Finance', 'Sales', 'Marketing'];

    constructor() {
        this.registerForm = this.fb.group(
            {
                name: ['', [Validators.required, Validators.minLength(3)]],
                email: ['', [Validators.required, Validators.email]],
                department: ['IT', Validators.required],
                password: ['', [Validators.required, Validators.minLength(6)]],
                confirmPassword: ['', [Validators.required]],
            },
            { validators: this.passwordMatchValidator },
        );
    }

    onRegister() {
        if (this.registerForm.invalid) return;

        this.loading.set(true);
        const formData: RegisterRequest = this.registerForm.value;

        this.authService.register(formData).subscribe({
            next: () => {
                this.snackbarService.success('Registration successful!');
                this.loading.set(false);
                this.router.navigate(['/home']);
            },
            error: (error) => {
                const message = error?.error?.message || 'Registration failed';
                this.snackbarService.error(message);
                this.loading.set(false);
            },
        });
    }

    private passwordMatchValidator(group: FormGroup) {
        const password = group.get('password')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { passwordMismatch: true };
    }
}
