import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
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
import { ChatVisibilityService } from '../../shared/services/chat-visibility.service';
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
export class LayoutComponent implements OnInit, OnDestroy {
    private themeService = inject(ThemeService);
    private snackbarService = inject(SnackbarService);
    notificationService = inject(NotificationService);
    chatVisibilityService = inject(ChatVisibilityService);
    userService = inject(UserService);
    private theme = this.themeService.getTheme();

    notifications = this.notificationService.notifications$;
    notificationCount = signal(0);
    private countSubscription: any;

    ngOnInit(): void {
        this.notificationService.subscribe();
        this.countSubscription = this.notificationService.getUnreadCount().subscribe((count) => {
            this.notificationCount.set(count);
        });
    }

    ngOnDestroy(): void {
        this.notificationService.unsubscribe();
        if (this.countSubscription) {
            this.countSubscription.unsubscribe();
        }
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

    formatDate(date: any, includeTime: boolean = false): string {
        if (Array.isArray(date)) {
            const [year, month, day, hour = 0, minute = 0] = date;
            const dateObj = new Date(year, month - 1, day, hour, minute);
            return includeTime
                ? dateObj.toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                  })
                : dateObj.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                  });
        }
        if (date instanceof Date) {
            return includeTime
                ? date.toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                  })
                : date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                  });
        }
        if (!date) return '';
        const dateObj = new Date(date);
        return includeTime
            ? dateObj.toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : dateObj.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
              });
    }
}
