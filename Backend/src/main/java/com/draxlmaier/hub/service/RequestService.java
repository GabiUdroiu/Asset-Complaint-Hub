package com.draxlmaier.hub.service;

import com.draxlmaier.hub.controller.NotificationController;
import com.draxlmaier.hub.dto.RequestDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.mapper.RequestMapper;
import com.draxlmaier.hub.model.Request;
import com.draxlmaier.hub.repository.RequestRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Optional;

@Stateless
@Transactional
public class RequestService implements IService<Request, RequestDTO> {

    @Inject
    private RequestRepository requestRepository;

    @Inject
    private RequestMapper requestMapper;

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
    public PaginatedResponse<RequestDTO> getAll(int page, int size, String status, String search) {
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

    public PaginatedResponse<RequestDTO> getAllByEmployee(int page, int size, String status, String search, Long employeeId) {
        var items = requestRepository.findAllByEmployeePaginated(page, size, status, search, employeeId)
            .stream()
            .map(requestMapper::toDTO)
            .toList();

        long total = requestRepository.countByEmployee(status, search, employeeId);

        return new PaginatedResponse<>(items, total, page, size);
    }

    @Override
    public Optional<RequestDTO> update(Long id, RequestDTO requestDTO) {
        return requestRepository.findById(id)
            .map(existing -> {
                String oldStatus = existing.getStatus().name();
                Request updated = requestMapper.updateEntity(existing, requestDTO);
                Request saved = requestRepository.save(updated);

                if (!oldStatus.equals(updated.getStatus().name())) {
                    NotificationController.sendNotificationToAll(
                        "request_updated",
                        "Request #" + id + " status changed to " + updated.getStatus().name()
                    );
                }

                return requestMapper.toDTO(saved);
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
