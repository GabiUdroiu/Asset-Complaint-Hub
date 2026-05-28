import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService, ApiResponse } from '../../../shared/services/api.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RecentItemsService } from '../../../shared/services/recent-items.service';
import { ListCacheService } from '../../../shared/services/list-cache.service';
import { UserService } from '../../../core/services/user.service';
import { WorkflowProgressComponent } from '../../../shared/components/workflow-progress/workflow-progress.component';
import { ComplaintDTO, CommentDTO, EmployeeDTO } from '../../../shared/models';

@Component({
    selector: 'complaint-detail',
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        DatePipe,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressBarModule,
        MatTooltipModule,
        WorkflowProgressComponent,
    ],
    templateUrl: './complaint-detail.html',
    styleUrl: './complaint-detail.scss',
})
export class ComplaintDetailComponent implements OnInit, OnDestroy {
    private apiService = inject(ApiService);
    private snackbarService = inject(SnackbarService);
    private route = inject(ActivatedRoute);
    private recentItemsService = inject(RecentItemsService);
    private listCache = inject(ListCacheService);
    userService = inject(UserService);

    complaint = signal<ComplaintDTO | null>(null);
    comments = signal<CommentDTO[]>([]);
    employees = signal<Map<number, EmployeeDTO>>(new Map());
    newComment = signal('');
    selectedStatus = signal('');
    accepted = signal(false);
    isLoading = signal(false);
    isLocked = signal(false);
    lockedByName = signal<string | null>(null);
    lockedById = signal<number | null>(null);
    currentComplaintId: number | null = null;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.currentComplaintId = Number(id);
            this.loadComplaint(Number(id));
            this.loadComments(Number(id));
            this.loadEmployees();
            this.checkIfAccepted(Number(id));
        }
    }

    ngOnDestroy() {
        if (this.currentComplaintId) {
            this.releaseLock(this.currentComplaintId);
        }
    }

    loadComplaint(id: number) {
        this.apiService.get<ComplaintDTO>(`complaints/${id}`).subscribe({
            next: (response: ApiResponse<ComplaintDTO>) => {
                this.complaint.set(response.data);
                if (response.data) {
                    this.selectedStatus.set(response.data.status);
                    this.recentItemsService.addItem({
                        id: response.data.id,
                        type: 'complaint',
                        title: response.data.title,
                        employeeId: response.data.employeeId,
                    });
                }
            },
            error: () => this.snackbarService.error('Failed to load complaint'),
        });
    }

    loadComments(complaintId: number) {
        this.apiService.get<CommentDTO[]>(`complaints/${complaintId}/comments`).subscribe({
            next: (response: ApiResponse<CommentDTO[]>) => {
                this.comments.set(response.data || []);
            },
            error: () => this.snackbarService.error('Failed to load comments'),
        });
    }

    loadEmployees() {
        this.apiService.get<{ items: EmployeeDTO[] }>('employees?page=0&size=100').subscribe({
            next: (response: ApiResponse<{ items: EmployeeDTO[] }>) => {
                const empMap = new Map<number, EmployeeDTO>();
                response.data.items.forEach((emp: EmployeeDTO) => empMap.set(emp.id, emp));
                this.employees.set(empMap);
            },
            error: () => console.log('Failed to load employees'),
        });
    }

    addComment() {
        const text = this.newComment();
        const currentComplaint = this.complaint();
        const currentUser = this.userService.currentUser();
        if (!text.trim() || !currentComplaint || !currentUser) return;

        const commentDTO = { text, complaintId: 0, employeeId: 0, id: 0, createdAt: '' };
        this.apiService
            .post<
                ApiResponse<CommentDTO>
            >(`complaints/${currentComplaint.id}/comments?employeeId=${currentUser.id}`, commentDTO)
            .subscribe({
                next: () => {
                    this.newComment.set('');
                    this.snackbarService.success('Comment added');
                    this.loadComments(currentComplaint.id);
                },
                error: () => this.snackbarService.error('Failed to add comment'),
            });
    }

    updateStatus() {
        const currentComplaint = this.complaint();
        if (!currentComplaint) return;

        const updated = {
            ...currentComplaint,
            status: this.selectedStatus(),
            version: currentComplaint.version || 0,
        };
        this.apiService
            .put<ApiResponse<ComplaintDTO>>(`complaints/${currentComplaint.id}`, updated)
            .subscribe({
                next: () => {
                    this.listCache.invalidateByPrefix('complaints');
                    this.snackbarService.success('Status updated');
                    this.loadComplaint(currentComplaint.id);
                },
                error: (error) => {
                    if (error.status === 409) {
                        this.snackbarService.error('Version conflict: another user has updated this item');
                        this.loadComplaint(currentComplaint.id);
                    } else if (error.status === 403) {
                        this.snackbarService.error('You do not have permission to update this complaint');
                    } else {
                        this.snackbarService.error('Failed to update status');
                    }
                },
            });
    }

    getEmployeeName(employeeId: number): string {
        return this.employees().get(employeeId)?.name || `Employee #${employeeId}`;
    }

    getEmployeeRole(employeeId: number): string {
        return this.employees().get(employeeId)?.role || '';
    }

    acceptComplaint() {
        const currentComplaint = this.complaint();
        if (!currentComplaint) return;

        const currentUser = this.userService.currentUser();
        if (!currentUser) return;

        this.isLoading.set(true);
        const taskPayload = {
            itemType: 'COMPLAINT',
            itemId: currentComplaint.id,
            acceptedBy: currentUser.id,
        };

        this.apiService.post('assignment-tasks', taskPayload).subscribe({
            next: () => {
                this.listCache.invalidateByPrefix('complaints');
                this.accepted.set(true);
                this.isLoading.set(false);
                this.snackbarService.success('Complaint accepted');
                if (this.currentComplaintId) {
                    this.acquireLock(this.currentComplaintId);
                }
            },
            error: () => {
                this.isLoading.set(false);
                this.snackbarService.error('Failed to accept complaint');
            },
        });
    }

    private checkIfAccepted(complaintId: number) {
        this.apiService.get<any>(`assignment-tasks/item/COMPLAINT/${complaintId}`).subscribe({
            next: (response: any) => {
                this.accepted.set(response != null);
            },
            error: () => {
                this.accepted.set(false);
            },
        });
    }

    private acquireLock(complaintId: number) {
        this.apiService.post<ComplaintDTO>(`complaints/${complaintId}/lock`, {}).subscribe({
            next: (response) => {
                if (response.data?.lockedByName) {
                    this.isLocked.set(true);
                    this.lockedByName.set(response.data.lockedByName);
                    this.lockedById.set(response.data.lockedById || null);
                }
            },
            error: (err) => {
                if (err.status === 409) {
                    const errorMsg = err.error?.message || 'Item is locked';
                    this.isLocked.set(true);
                    this.lockedByName.set(errorMsg.replace('Item is locked by: ', ''));
                    this.snackbarService.error(errorMsg);
                } else if (err.status !== 403) {
                    this.snackbarService.error('Failed to acquire lock');
                }
            },
        });
    }

    private releaseLock(complaintId: number) {
        this.apiService.delete(`complaints/${complaintId}/lock`).subscribe({
            error: () => {},
        });
    }
}
