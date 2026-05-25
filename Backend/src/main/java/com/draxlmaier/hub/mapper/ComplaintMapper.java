package com.draxlmaier.hub.mapper;

import com.draxlmaier.hub.dto.ComplaintDTO;
import com.draxlmaier.hub.model.Complaint;
import jakarta.ejb.Singleton;

@Singleton
public class ComplaintMapper {

    public ComplaintDTO toDTO(Complaint entity) {
        if (entity == null) return null;

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
            entity.getUpdatedAt()
        );
    }

    public Complaint toEntity(ComplaintDTO dto) {
        if (dto == null) return null;

        return Complaint.builder()
            .title(dto.title())
            .description(dto.description())
            .status(Complaint.Status.valueOf(dto.status() != null ? dto.status() : "NEW"))
            .build();
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
