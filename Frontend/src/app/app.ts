import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SnackbarComponent } from './shared/components/snackbar/snackbar.component';
import { NotificationService } from './shared/services/notification.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    styleUrl: './app.css',
    imports: [SnackbarComponent, RouterOutlet],
})
export class App implements OnInit, OnDestroy {
    protected readonly title = signal('Asset Complaint Hub');
    private notificationService = inject(NotificationService);

    ngOnInit(): void {
        this.notificationService.subscribe();
    }

    ngOnDestroy(): void {
        this.notificationService.unsubscribe();
    }
}
