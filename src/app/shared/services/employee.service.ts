import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface EmployeeDTO {
    id: number;
    name: string;
    email: string;
    role?: string;
    departmentId?: number;
}

@Injectable({
    providedIn: 'root'
})
export class EmployeeService {
    private apiService = inject(ApiService);

    getEmployees(): Observable<any> {
        return this.apiService.get('employees');
    }

    getEmployee(id: number): Observable<any> {
        return this.apiService.get(`employees/${id}`);
    }

    createEmployee(employee: Partial<EmployeeDTO>): Observable<any> {
        return this.apiService.post('employees', employee);
    }

    updateEmployee(id: number, employee: Partial<EmployeeDTO>): Observable<any> {
        return this.apiService.put(`employees/${id}`, employee);
    }

    deleteEmployee(id: number): Observable<any> {
        return this.apiService.delete(`employees/${id}`);
    }
}
