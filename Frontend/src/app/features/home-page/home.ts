import { CommonModule, JsonPipe, DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    inject,
    signal,
    computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiResponse, ApiService } from '../../shared/services/api.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { UserService } from '../../core/services/user.service';
import { RecentItemsService } from '../../shared/services/recent-items.service';
import { AnnouncementService, Announcement } from '../../shared/services/announcement.service';

type HomeShortcut = {
    title: string;
    description: string;
    icon: string;
    action: string;
};

type HomeRecentItem = {
    id: number;
    type: 'request' | 'complaint';
    title: string;
    timestamp: number;
};

@Component({
    selector: 'home-page',
    template: `
        <section class="home-shell">
            <section class="cards-grid" aria-label="Main modules">
                @for (item of shortcuts(); track item.title) {
                    <mat-card class="feature-card">
                        <mat-card-header>
                            <div class="card-avatar">
                                <mat-icon>{{ item.icon }}</mat-icon>
                            </div>
                            <div>
                                <mat-card-title>{{ item.title }}</mat-card-title>
                                <mat-card-subtitle>{{ item.description }}</mat-card-subtitle>
                            </div>
                        </mat-card-header>

                        <mat-card-actions>
                            <button matButton class="action-btns" (click)="openShortcut(item)">
                                {{ item.action }}
                            </button>
                        </mat-card-actions>
                    </mat-card>
                }
            </section>

            <section class="dashboard-grid">
                <mat-card class="combined-panel">
                    <mat-card-content>
                        <div class="announcements-section">
                            <h3 class="section-title">Announcements</h3>
                            @if (announcements().length === 0) {
                                <p class="no-data">No announcements at the moment</p>
                            } @else {
                                <div class="announcement-item">
                                    <div class="announcement-header">
                                        <h4 class="announcement-title">{{ announcements()[0]?.title }}</h4>
                                        <span class="announcement-date">{{ announcements()[0]?.date | date: 'short' }}</span>
                                    </div>
                                    <p class="announcement-description">{{ announcements()[0]?.description }}</p>
                                </div>
                            }
                        </div>

                        <div class="divider"></div>

                        <div class="recent-section">
                            <h3 class="section-title">Recent Activities</h3>
                            @if (recentItems().length === 0) {
                                <p class="no-data">No recent activities</p>
                            } @else {
                                <div class="recent-list">
                                    @for (item of displayedRecentItems(); track item.type + '-' + item.id) {
                                        <div class="recent-item" (click)="navigateToItem(item)">
                                            <div class="item-icon">
                                                <mat-icon>{{
                                                    item.type === 'request'
                                                        ? 'assignment'
                                                        : 'report_problem'
                                                }}</mat-icon>
                                            </div>
                                            <div class="item-content">
                                                <span class="item-type"
                                                    >{{
                                                        item.type === 'request'
                                                            ? 'Request'
                                                            : 'Complaint'
                                                    }}-{{ item.id }}</span
                                                >
                                                <span class="item-date">{{
                                                    item.timestamp | date: 'short'
                                                }}</span>
                                            </div>
                                            <button
                                                mat-icon-button
                                                class="delete-btn"
                                                (click)="$event.stopPropagation(); deleteRecentItem(item.id, item.type)"
                                                matTooltip="Remove from recent"
                                            >
                                                <mat-icon>close</mat-icon>
                                            </button>
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </mat-card-content>
                </mat-card>
            </section>
        </section>
    `,
    styleUrl: 'home.scss',
    imports: [
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatTooltipModule,
        DatePipe,
    ],
})
export class HomePageComponent implements OnInit {
    snackbar = inject(SnackbarService);
    private readonly apiService = inject(ApiService);
    private readonly router = inject(Router);
    private readonly recentItemsService = inject(RecentItemsService);
    private readonly announcementService = inject(AnnouncementService);
    userService = inject(UserService);

    private readonly maxDisplayItems = 5;

    private readonly allShortcuts: HomeShortcut[] = [
        {
            title: 'Assets',
            description: 'Inventory, status, ownership and visibility for what we manage.',
            icon: 'inventory_2',
            action: 'Open Assets',
        },
        {
            title: 'Requests',
            description: 'Requests, approvals and request tracking in one place.',
            icon: 'assignment',
            action: 'Open Requests',
        },
        {
            title: 'Complaints',
            description: 'Issues, priority and resolution, without cluttering the homepage.',
            icon: 'report_problem',
            action: 'Open Complaints',
        },
        {
            title: 'Admin',
            description: 'Admin dashboard for managing assets, users and complaints.',
            icon: 'admin_panel_settings',
            action: 'Open Admin',
        },
    ];

    shortcuts = computed(() => {
        const isAdmin = this.userService.isResponsible();
        const inSupportMode = this.userService.isInSupportMode();
        return this.allShortcuts.filter(
            (item) => item.title !== 'Admin' || (isAdmin && inSupportMode),
        );
    });

    announcements = signal<Announcement[]>([]);

    recentItems = signal<HomeRecentItem[]>([]);

    displayedRecentItems = computed(() =>
        this.recentItems().slice(0, this.maxDisplayItems)
    );

    data = signal<ApiResponse<unknown> | null>(null);

    ngOnInit() {
        this.loadApiData();
        this.loadRecentItems();
        this.loadAnnouncements();
    }

    private loadRecentItems() {
        const allItems = this.recentItemsService.getItems();
        const filtered = allItems.filter((item) => {
            if (this.userService.isInSupportMode()) {
                return true;
            }
            const currentUserId = this.userService.currentUser()?.id;
            return item.employeeId === currentUserId;
        });
        this.recentItems.set(filtered as HomeRecentItem[]);
    }

    openShortcut(item: HomeShortcut) {
        const routeMap: { [key: string]: string } = {
            Assets: '/assets',
            Requests: '/requests',
            Complaints: '/complaints',
            Admin: '/admin',
        };
        const route = routeMap[item.title];
        if (route) {
            this.router.navigate([route]);
        }
    }

    loadApiData() {
        this.apiService.get('test').subscribe({
            next: (data) => {
                console.log('API response:', data);
                this.snackbar.open('API call successful!', 'success');
                this.data.set(data);
            },
            error: (error: unknown) => {
                console.error('API error:', error);
                this.snackbar.open('API call failed!', 'error');
            },
        });
    }

    deleteRecentItem(id: number, type: 'request' | 'complaint') {
        this.recentItemsService.removeItem(id, type);
        this.loadRecentItems();
    }

    navigateToItem(item: HomeRecentItem) {
        const route = item.type === 'request' ? `/requests/${item.id}` : `/complaints/${item.id}`;
        this.router.navigate([route]);
    }

    private loadAnnouncements() {
        this.announcementService.announcements$.subscribe((announcements) => {
            this.announcements.set(announcements);
        });
    }
}
