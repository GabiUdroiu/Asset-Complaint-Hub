package com.draxlmaier.hub.mapper;

import com.draxlmaier.hub.dto.AssetDTO;
import com.draxlmaier.hub.model.Asset;
import com.draxlmaier.hub.repository.EmployeeRepository;
import jakarta.ejb.Singleton;
import jakarta.inject.Inject;
import java.time.LocalDateTime;

@Singleton
public class AssetMapper {

    @Inject
    private EmployeeRepository employeeRepository;

    public AssetDTO toDTO(Asset entity) {
        if (entity == null) return null;

        return new AssetDTO(
            entity.getId(),
            entity.getName(),
            entity.getSerialNumber(),
            entity.getCategory(),
            entity.getStatus(),
            entity.getLastUpdated(),
            entity.getEmployee() != null ? entity.getEmployee().getId() : null,
            entity.getEmployee() != null ? entity.getEmployee().getName() : null,
            entity.getEmployee() != null && entity.getEmployee().getDepartment() != null
                ? entity.getEmployee().getDepartment().getName() : null
        );
    }

    public Asset toEntity(AssetDTO dto) {
        if (dto == null) return null;

        Asset asset = Asset.builder()
            .name(dto.name())
            .serialNumber(dto.serialNumber())
            .category(dto.category())
            .status(dto.status())
            .lastUpdated(LocalDateTime.now())
            .build();

        if (dto.employeeId() != null && dto.employeeId() > 0) {
            employeeRepository.findById(dto.employeeId())
                .ifPresent(asset::setEmployee);
        }

        return asset;
    }

    public Asset updateEntity(Asset existingAsset, AssetDTO dto) {
        if (dto == null) return existingAsset;

        if (dto.name() != null) {
            existingAsset.setName(dto.name());
        }
        if (dto.serialNumber() != null) {
            existingAsset.setSerialNumber(dto.serialNumber());
        }
        if (dto.category() != null) {
            existingAsset.setCategory(dto.category());
        }
        if (dto.status() != null) {
            existingAsset.setStatus(dto.status());
        }

        if (dto.employeeId() != null && dto.employeeId() > 0) {
            employeeRepository.findById(dto.employeeId())
                .ifPresent(existingAsset::setEmployee);
        } else {
            existingAsset.setEmployee(null);
        }

        existingAsset.setLastUpdated(LocalDateTime.now());

        return existingAsset;
    }
}
