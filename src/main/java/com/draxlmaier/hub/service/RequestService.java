package com.draxlmaier.hub.service;

import com.draxlmaier.hub.controller.NotificationController;
import com.draxlmaier.hub.dto.RequestDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.mapper.RequestMapper;
import com.draxlmaier.hub.model.Request;
import com.draxlmaier.hub.repository.EmployeeRepository;
import com.draxlmaier.hub.repository.RequestRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Optional;

@Stateless
@Transactional
public class RequestService implements IService<Request, RequestDTO> {

    @Inject
    private EmployeeRepository employeeRepository;

    @Inject
    private RequestRepository requestRepository;

    @Inject
    private RequestMapper requestMapper;

    @Inject
    private NotificationService notificationService;

    @Override
    public RequestDTO create(RequestDTO requestDTO) {
        Request request = requestMapper.toEntity(requestDTO);
        Request saved = requestRepository.save(request);
        return requestMapper.toDTO(saved);
    }

    @Override
    public Optional<RequestDTO> get(Long id) {
        return requestRepository.findById(id)
            .map(requestMapper::toDTO);
    }

    @Override
    public PaginatedResponse<RequestDTO> getAll(int page, int size, String status, String category, String search) {
        return getAll(page, size, status, search, "createdAt", "DESC");
    }

    public PaginatedResponse<RequestDTO> getAll(int page, int size, String status, String search, String sortBy, String sortOrder) {
        var items = requestRepository.findAllPaginated(page, size, status, search, sortBy, sortOrder)
            .stream()
            .map(requestMapper::toDTO)
            .toList();

        long total = requestRepository.countWithFilters(status, search);

        return new PaginatedResponse<>(items, total, page, size);
    }

    public PaginatedResponse<RequestDTO> getAllByEmployee(int page, int size, String status, String category, String search, Long employeeId) {
        var items = requestRepository.findAllByEmployeePaginated(page, size, status, search, employeeId)
            .stream()
            .map(requestMapper::toDTO)
            .toList();

        long total = requestRepository.countByEmployee(status, search, employeeId);

        return new PaginatedResponse<>(items, total, page, size);
    }

    public PaginatedResponse<RequestDTO> getAllByDepartment(int page, int size, String status, String search, Long departmentId) {
        var items = requestRepository.findAllByDepartmentPaginated(page, size, status, search, departmentId)
            .stream()
            .map(requestMapper::toDTO)
            .toList();

        long total = requestRepository.countByDepartment(status, search, departmentId);

        return new PaginatedResponse<>(items, total, page, size);
    }

    @Override
    public Optional<RequestDTO> update(Long id, RequestDTO requestDTO) {
        return requestRepository.findById(id)
            .map(existing -> {
                // Check if locked by someone else
                if (existing.getLockedBy() != null && existing.getLockedAt() != null) {
                    // Check if lock is still valid (less than 30 minutes old)
                    if (java.time.LocalDateTime.now().isBefore(existing.getLockedAt().plusMinutes(30))) {
                        throw new jakarta.ws.rs.BadRequestException(
                            "Item is locked by: " + existing.getLockedBy().getName()
                        );
                    }
                    // Lock expired, clear it
                    existing.setLockedBy(null);
                    existing.setLockedAt(null);
                }

                String oldStatus = existing.getStatus().name();
                Request updated = requestMapper.updateEntity(existing, requestDTO);
                // Release lock after update
                updated.setLockedBy(null);
                updated.setLockedAt(null);
                Request saved = requestRepository.save(updated);

                if (!oldStatus.equals(updated.getStatus().name())) {
                    String message = "Request #" + id + " status changed to " + updated.getStatus().name();
                    // Persist notification to database for the associated employee
                    if (saved.getEmployee() != null) {
                        notificationService.create(
                            saved.getEmployee().getId(),
                            "request_updated",
                            message,
                            null
                        );
                    }
                }

                return requestMapper.toDTO(saved);
            });
    }

    public Optional<RequestDTO> acquireLock(Long id, Long userId) {
        return requestRepository.findById(id)
            .map(existing -> {
                if (existing.getLockedBy() != null && existing.getLockedAt() != null) {
                    // Check if lock is still valid
                    if (java.time.LocalDateTime.now().isBefore(existing.getLockedAt().plusMinutes(30))) {
                        throw new jakarta.ws.rs.BadRequestException(
                            "Item is locked by: " + existing.getLockedBy().getName()
                        );
                    }
                    // Lock expired, we can take it
                }

                // Acquire lock
                existing.setLockedBy(employeeRepository.findById(userId).orElse(null));
                existing.setLockedAt(java.time.LocalDateTime.now());
                Request saved = requestRepository.save(existing);
                return requestMapper.toDTO(saved);
            });
    }

    public void releaseLock(Long id, Long userId) {
        requestRepository.findById(id).ifPresent(existing -> {
            // Only allow release if locked by the same user
            if (existing.getLockedBy() != null && existing.getLockedBy().getId().equals(userId)) {
                existing.setLockedBy(null);
                existing.setLockedAt(null);
                requestRepository.save(existing);
            }
        });
    }

    @Override
    public boolean delete(Long id) {
        if (requestRepository.existsById(id)) {
            requestRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
