export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface PaginatedApiResponse<T> {
    success: boolean;
    data: {
        items: T[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
    message?: string;
}
