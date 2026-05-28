package com.draxlmaier.hub.service;

import com.draxlmaier.hub.dto.PaginatedResponse;
import java.util.Optional;

public interface IService<T, D> {
    D create(D dto);
    Optional<D> get(Long id);
    PaginatedResponse<D> getAll(int page, int size, String status, String category, String search);
    PaginatedResponse<D> getAllByEmployee(int page, int size, String status, String category, String search, Long employeeId);
    PaginatedResponse<D> getAllByDepartment(int page, int size, String status, String search, Long departmentId);
    Optional<D> update(Long id, D dto);
    boolean delete(Long id);
}
