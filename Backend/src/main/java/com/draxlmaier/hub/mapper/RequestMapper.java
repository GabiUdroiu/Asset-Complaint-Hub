package com.draxlmaier.hub.mapper;

import com.draxlmaier.hub.dto.RequestDTO;
import com.draxlmaier.hub.model.Request;
import com.draxlmaier.hub.repository.EmployeeRepository;
import jakarta.ejb.Singleton;
import jakarta.inject.Inject;
import java.time.LocalDateTime;

@Singleton
public class RequestMapper {

    @Inject
    private EmployeeRepository employeeRepository;

    public RequestDTO toDTO(Request entity) {
        if (entity == null) return null;

        return new RequestDTO(
            entity.getId(),
            entity.getTitle(),
            entity.getDescription(),
            entity.getStatus().name(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            entity.getEmployee() != null ? entity.getEmployee().getId() : null,
            entity.getEmployee() != null ? entity.getEmployee().getName() : null,
            entity.getEmployee() != null && entity.getEmployee().getDepartment() != null ? entity.getEmployee().getDepartment().getName() : null,
            entity.getAsset() != null ? entity.getAsset().getId() : null
        );
    }

    public Request toEntity(RequestDTO dto) {
        if (dto == null) return null;

        Request request = Request.builder()
            .title(dto.title())
            .description(dto.description())
            .status(Request.Status.valueOf(dto.status() != null ? dto.status() : "PENDING"))
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        if (dto.employeeId() != null) {
            request.setEmployee(employeeRepository.findById(dto.employeeId()).orElse(null));
        }

        return request;
    }

    public Request updateEntity(Request existing, RequestDTO dto) {
        if (dto == null) return existing;

        if (dto.title() != null) {
            existing.setTitle(dto.title());
        }
        if (dto.description() != null) {
            existing.setDescription(dto.description());
        }
        if (dto.status() != null) {
            existing.setStatus(Request.Status.valueOf(dto.status()));
        }
        existing.setUpdatedAt(LocalDateTime.now());

        return existing;
    }
}
