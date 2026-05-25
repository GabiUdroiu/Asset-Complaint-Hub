package com.draxlmaier.hub.service;

import com.draxlmaier.hub.dto.PaginatedResponse;
import java.util.Optional;

public interface IService<T, D> {
    D create(D dto);
    Optional<D> get(Long id);
    PaginatedResponse<D> getAll(int page, int size, String status, String search);
    PaginatedResponse<D> getAllByEmployee(int page, int size, String status, String search, Long employeeId);
    Optional<D> update(Long id, D dto);
    boolean delete(Long id);
}
