package com.draxlmaier.hub.service;

import com.draxlmaier.hub.controller.NotificationController;
import com.draxlmaier.hub.dto.ComplaintDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.mapper.ComplaintMapper;
import com.draxlmaier.hub.model.Complaint;
import com.draxlmaier.hub.repository.ComplaintRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

@Stateless
@Transactional
public class ComplaintService implements IService<Complaint, ComplaintDTO> {

    @Inject
    private ComplaintRepository complaintRepository;

    @Inject
    private ComplaintMapper complaintMapper;

    @Override
    public ComplaintDTO create(ComplaintDTO complaintDTO) {
        Complaint complaint = complaintMapper.toEntity(complaintDTO);
        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());
        Complaint saved = complaintRepository.save(complaint);
        return complaintMapper.toDTO(saved);
    }

    @Override
    public Optional<ComplaintDTO> get(Long id) {
        return complaintRepository.findById(id)
            .map(complaintMapper::toDTO);
    }

    @Override
    public PaginatedResponse<ComplaintDTO> getAll(int page, int size, String status, String search) {
        var items = complaintRepository.findAllPaginated(page, size, status, search)
            .stream()
            .map(complaintMapper::toDTO)
            .toList();

        long total = complaintRepository.countWithFilters(status, search);

        return new PaginatedResponse<>(items, total, page, size);
    }

    public PaginatedResponse<ComplaintDTO> getAllByEmployee(int page, int size, String status, String search, Long employeeId) {
        var items = complaintRepository.findAllByEmployeePaginated(page, size, status, search, employeeId)
            .stream()
            .map(complaintMapper::toDTO)
            .toList();

        long total = complaintRepository.countByEmployee(status, search, employeeId);

        return new PaginatedResponse<>(items, total, page, size);
    }

    @Override
    public Optional<ComplaintDTO> update(Long id, ComplaintDTO complaintDTO) {
        return complaintRepository.findById(id)
            .map(existing -> {
                String oldStatus = existing.getStatus().name();
                Complaint updated = complaintMapper.updateEntity(existing, complaintDTO);
                Complaint saved = complaintRepository.save(updated);

                if (!oldStatus.equals(updated.getStatus().name())) {
                    NotificationController.sendNotificationToAll(
                        "complaint_updated",
                        "Complaint #" + id + " status changed to " + updated.getStatus().name()
                    );
                }

                return complaintMapper.toDTO(saved);
            });
    }

    @Override
    public boolean delete(Long id) {
        if (complaintRepository.existsById(id)) {
            complaintRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
