import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface TaskDTO {
    id?: number;
    itemType: string;
    itemId: number;
    acceptedBy: number;
    acceptedAt?: Date;
    status?: string;
    acceptedByName?: string;
    itemTitle?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private apiService = inject(ApiService);

    createTask(task: TaskDTO): Observable<any> {
        return this.apiService.post('assignment-tasks', task);
    }

    getTask(id: number): Observable<any> {
        return this.apiService.get(`assignment-tasks/${id}`);
    }

    getAllTasks(page: number = 0, size: number = 10): Observable<any> {
        return this.apiService.get(`assignment-tasks?page=${page}&size=${size}`);
    }

    getTaskByItemTypeAndItemId(itemType: string, itemId: number): Observable<any> {
        return this.apiService.get(`assignment-tasks/item/${itemType}/${itemId}`);
    }

    getTasksByType(itemType: string, page: number = 0, size: number = 10): Observable<any> {
        return this.apiService.get(`assignment-tasks/by-type/${itemType}?page=${page}&size=${size}`);
    }

    getTasksByUser(userId: number, page: number = 0, size: number = 10): Observable<any> {
        return this.apiService.get(`assignment-tasks/by-user/${userId}?page=${page}&size=${size}`);
    }

    updateTask(id: number, task: Partial<TaskDTO>): Observable<any> {
        return this.apiService.put(`assignment-tasks/${id}`, task);
    }

    deleteTask(id: number): Observable<any> {
        return this.apiService.delete(`assignment-tasks/${id}`);
    }
}
