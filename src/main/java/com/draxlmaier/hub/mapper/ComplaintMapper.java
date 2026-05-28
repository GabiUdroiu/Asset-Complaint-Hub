package com.draxlmaier.hub.mapper;

import com.draxlmaier.hub.dto.ComplaintDTO;
import com.draxlmaier.hub.model.Complaint;
import com.draxlmaier.hub.repository.EmployeeRepository;
import com.draxlmaier.hub.repository.AssetRepository;
import com.draxlmaier.hub.repository.ComplaintWorkflowRepository;
import jakarta.ejb.Singleton;
import jakarta.inject.Inject;

@Singleton
public class ComplaintMapper {

    @Inject
    private EmployeeRepository employeeRepository;

    @Inject
    private AssetRepository assetRepository;

    @Inject
    private ComplaintWorkflowRepository workflowRepository;

    public ComplaintDTO toDTO(Complaint entity) {
        if (entity == null) return null;

        // Fetch acceptance info from workflow history
        Long acceptedBy = null;
        String acceptedByName = null;
        java.time.LocalDateTime acceptedAt = null;

        if (entity.getId() != null) {
            var workflows = workflowRepository.findByComplaintId(entity.getId());
            if (workflows != null && !workflows.isEmpty()) {
                // Get the first status change away from NEW (earliest acceptance)
                var workflow = workflows.stream()
                    .filter(w -> w.getOldStatus() == null || !w.getOldStatus().equals(Complaint.Status.NEW))
                    .findFirst()
                    .orElse(workflows.get(0));

                if (workflow != null && workflow.getEmployee() != null) {
                    acceptedBy = workflow.getEmployee().getId();
                    acceptedByName = workflow.getEmployee().getName();
                    acceptedAt = workflow.getChangedAt();
                }
            }
        }

        return new ComplaintDTO(
            entity.getId(),
            entity.getTitle(),
            entity.getDescription(),
            entity.getAsset() != null ? entity.getAsset().getId() : null,
            entity.getEmployee() != null ? entity.getEmployee().getId() : null,
            entity.getEmployee() != null ? entity.getEmployee().getName() : null,
            entity.getEmployee() != null && entity.getEmployee().getDepartment() != null ? entity.getEmployee().getDepartment().getName() : null,
            entity.getStatus().name(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            acceptedBy,
            acceptedByName,
            acceptedAt,
            entity.getLockedBy() != null ? entity.getLockedBy().getId() : null,
            entity.getLockedBy() != null ? entity.getLockedBy().getName() : null,
            entity.getLockedAt(),
            entity.getVersion()
        );
    }

    public Complaint toEntity(ComplaintDTO dto) {
        if (dto == null) return null;

        Complaint complaint = Complaint.builder()
            .title(dto.title())
            .description(dto.description())
            .status(Complaint.Status.valueOf(dto.status() != null ? dto.status() : "NEW"))
            .build();

        if (dto.employeeId() != null) {
            employeeRepository.findById(dto.employeeId()).ifPresent(complaint::setEmployee);
        }
        if (dto.assetId() != null) {
            assetRepository.findById(dto.assetId()).ifPresent(complaint::setAsset);
        }

        return complaint;
    }

    public Complaint updateEntity(Complaint existing, ComplaintDTO dto) {
        if (dto == null) return existing;

        if (dto.title() != null) {
            existing.setTitle(dto.title());
        }
        if (dto.description() != null) {
            existing.setDescription(dto.description());
        }
        if (dto.status() != null) {
            existing.setStatus(Complaint.Status.valueOf(dto.status()));
        }
        existing.setUpdatedAt(java.time.LocalDateTime.now());

        return existing;
    }
}
