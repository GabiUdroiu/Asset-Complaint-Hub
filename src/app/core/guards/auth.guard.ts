import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = () => {
    const userService = inject(UserService);
    const router = inject(Router);

    if (userService.isLoggedIn()) {
        return true;
    }

    router.navigate(['/login']);
    return false;
};

export const adminGuard: CanActivateFn = () => {
    const userService = inject(UserService);
    const router = inject(Router);

    if (userService.isAdmin() || userService.isResponsible()) {
        return true;
    }

    router.navigate(['/home']);
    return false;
};

export const responsibleGuard: CanActivateFn = () => {
    const userService = inject(UserService);
    const router = inject(Router);

    if (userService.isResponsible()) {
        return true;
    }

    router.navigate(['/home']);
    return false;
};
