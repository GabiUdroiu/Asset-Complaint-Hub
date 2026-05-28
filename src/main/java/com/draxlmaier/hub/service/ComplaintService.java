package com.draxlmaier.hub.service;

import com.draxlmaier.hub.controller.NotificationController;
import com.draxlmaier.hub.dto.ComplaintDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.mapper.ComplaintMapper;
import com.draxlmaier.hub.model.Complaint;
import com.draxlmaier.hub.repository.ComplaintRepository;
import com.draxlmaier.hub.repository.AssetRepository;
import com.draxlmaier.hub.repository.EmployeeRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import java.time.LocalDateTime;
import java.util.Optional;

@Stateless
@Transactional
public class ComplaintService implements IService<Complaint, ComplaintDTO> {

    @Inject
    private ComplaintRepository complaintRepository;

    @Inject
    private ComplaintMapper complaintMapper;

    @Inject
    private NotificationService notificationService;
    
    @Inject
    private AssetRepository assetRepository;
    
    @Inject
    private EmployeeRepository employeeRepository;

    @Override
    public ComplaintDTO create(ComplaintDTO complaintDTO) {
        // Validate required fields
        if (complaintDTO.title() == null || complaintDTO.title().trim().isEmpty()) {
            throw new BadRequestException("Title cannot be blank");
        }
        if (complaintDTO.description() == null || complaintDTO.description().trim().isEmpty()) {
            throw new BadRequestException("Description cannot be blank");
        }
        if (complaintDTO.employeeId() == null) {
            throw new BadRequestException("Employee ID cannot be null");
        }
        if (complaintDTO.assetId() == null) {
            throw new BadRequestException("Asset ID cannot be null");
        }
        
        // Validate that referenced entities exist
        if (!employeeRepository.existsById(complaintDTO.employeeId())) {
            throw new NotFoundException("Employee with ID " + complaintDTO.employeeId() + " not found");
        }
        if (!assetRepository.existsById(complaintDTO.assetId())) {
            throw new NotFoundException("Asset with ID " + complaintDTO.assetId() + " not found");
        }
        
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
    public PaginatedResponse<ComplaintDTO> getAll(int page, int size, String status, String category, String search) {
        var items = complaintRepository.findAllPaginated(page, size, status, search)
            .stream()
            .map(complaintMapper::toDTO)
            .toList();

        long total = complaintRepository.countWithFilters(status, search);

        return new PaginatedResponse<>(items, total, page, size);
    }

    public PaginatedResponse<ComplaintDTO> getAllByEmployee(int page, int size, String status, String category, String search, Long employeeId) {
        var items = complaintRepository.findAllByEmployeePaginated(page, size, status, search, employeeId)
            .stream()
            .map(complaintMapper::toDTO)
            .toList();

        long total = complaintRepository.countByEmployee(status, search, employeeId);

        return new PaginatedResponse<>(items, total, page, size);
    }

    public PaginatedResponse<ComplaintDTO> getAllByDepartment(int page, int size, String status, String search, Long departmentId) {
        var items = complaintRepository.findAllByDepartmentPaginated(page, size, status, search, departmentId)
            .stream()
            .map(complaintMapper::toDTO)
            .toList();

        long total = complaintRepository.countByDepartment(status, search, departmentId);

        return new PaginatedResponse<>(items, total, page, size);
    }

    @Override
    public Optional<ComplaintDTO> update(Long id, ComplaintDTO complaintDTO) {
        return complaintRepository.findById(id)
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
                Complaint updated = complaintMapper.updateEntity(existing, complaintDTO);
                // Release lock after update
                updated.setLockedBy(null);
                updated.setLockedAt(null);
                Complaint saved = complaintRepository.save(updated);

                if (!oldStatus.equals(updated.getStatus().name())) {
                    String message = "Complaint #" + id + " status changed to " + updated.getStatus().name();
                    // Persist notification to database for the associated employee
                    if (saved.getEmployee() != null) {
                        notificationService.create(
                            saved.getEmployee().getId(),
                            "complaint_updated",
                            message,
                            null
                        );
                    }
                }

                return complaintMapper.toDTO(saved);
            });
    }

    public Optional<ComplaintDTO> acquireLock(Long id, Long userId) {
        return complaintRepository.findById(id)
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
                Complaint saved = complaintRepository.save(existing);
                return complaintMapper.toDTO(saved);
            });
    }

    public void releaseLock(Long id, Long userId) {
        complaintRepository.findById(id).ifPresent(existing -> {
            // Only allow release if locked by the same user
            if (existing.getLockedBy() != null && existing.getLockedBy().getId().equals(userId)) {
                existing.setLockedBy(null);
                existing.setLockedAt(null);
                complaintRepository.save(existing);
            }
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
