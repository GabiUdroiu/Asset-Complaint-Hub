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
    templateUrl: 'home.html',
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

    private readonly maxDisplayItems = 4;

    private readonly allShortcuts: HomeShortcut[] = [
        {
            title: 'Assets',
            description: 'Inventory, status, ownership and visibility.',
            icon: 'inventory_2',
            action: 'Open Assets',
        },
        {
            title: 'Requests',
            description: 'Requests, approvals and request tracking.',
            icon: 'assignment',
            action: 'Open Requests',
        },
        {
            title: 'Complaints',
            description: 'Issues, priority and resolution.',
            icon: 'report_problem',
            action: 'Open Complaints',
        },
        {
            title: 'Admin',
            description: 'Managing assets, users and complaints.',
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
