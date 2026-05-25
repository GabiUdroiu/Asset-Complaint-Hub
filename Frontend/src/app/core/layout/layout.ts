import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { RouterOutlet, RouterLinkWithHref, RouterLink } from '@angular/router';
import { ThemeService } from '../../shared/services/theme.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { NotificationService } from '../../shared/services/notification.service';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { ROLE_LABELS, ROLE_COLORS } from '../../shared/models/user.model';

@Component({
    selector: 'layout',
    templateUrl: './layout.html',
    styleUrls: ['./layout.scss'],
    imports: [
        CommonModule,
        RouterOutlet,
        MatButtonModule,
        MatIconModule,
        MatBadgeModule,
        MatTooltipModule,
        MatMenuModule,
        MatChipsModule,
        MatDividerModule,
        RouterLinkWithHref,
    ],
})
export class LayoutComponent {
    private themeService = inject(ThemeService);
    private snackbarService = inject(SnackbarService);
    notificationService = inject(NotificationService);
    userService = inject(UserService);
    private theme = this.themeService.getTheme();

    notifications = this.notificationService.notifications$;
    notificationCount = signal(0);

    constructor() {
        this.notificationService.getUnreadCount().subscribe((count) => {
            this.notificationCount.set(count);
        });
    }

    isLightMode = computed(() => this.theme() === 'light');
    roleLabels = ROLE_LABELS;
    roleColors = ROLE_COLORS;

    toggleTheme() {
        this.themeService.toggleTheme();
        this.snackbarService.open(`Switched to ${this.theme()} mode`, 'info');
    }

    deleteNotification(id: string) {
        this.notificationService.dismiss(id);
    }

    clearAllNotifications() {
        this.notificationService.dismissAll();
    }
}
