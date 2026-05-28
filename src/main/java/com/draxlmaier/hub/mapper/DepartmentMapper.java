package com.draxlmaier.hub.mapper;

import com.draxlmaier.hub.dto.DepartmentDTO;
import com.draxlmaier.hub.model.Department;
import jakarta.ejb.Singleton;

@Singleton
public class DepartmentMapper {

    public DepartmentDTO toDTO(Department entity) {
        if (entity == null) return null;

        return new DepartmentDTO(
            entity.getId(),
            entity.getName(),
            entity.getResponsibleEmployee() != null ? entity.getResponsibleEmployee().getId() : null,
            entity.getResponsibleEmployee() != null ? entity.getResponsibleEmployee().getName() : null
        );
    }

    public Department toEntity(DepartmentDTO dto) {
        if (dto == null) return null;

        return Department.builder()
            .name(dto.name())
            .build();
    }

    public Department updateEntity(Department existing, DepartmentDTO dto) {
        if (dto == null) return existing;

        if (dto.name() != null) {
            existing.setName(dto.name());
        }

        return existing;
    }
}
