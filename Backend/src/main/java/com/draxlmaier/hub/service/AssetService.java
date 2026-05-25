package com.draxlmaier.hub.service;

import com.draxlmaier.hub.dto.AssetDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.mapper.AssetMapper;
import com.draxlmaier.hub.model.Asset;
import com.draxlmaier.hub.repository.AssetRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Optional;

@Stateless
@Transactional
public class AssetService implements IService<Asset, AssetDTO> {

    @Inject
    private AssetRepository assetRepository;

    @Inject
    private AssetMapper assetMapper;

    @Override
    public AssetDTO create(AssetDTO assetDTO) {
        Asset asset = assetMapper.toEntity(assetDTO);
        Asset saved = assetRepository.save(asset);
        return assetMapper.toDTO(saved);
    }

    @Override
    public Optional<AssetDTO> get(Long id) {
        return assetRepository.findById(id)
            .map(assetMapper::toDTO);
    }

    @Override
    public PaginatedResponse<AssetDTO> getAll(int page, int size, String status, String search) {
        return getAll(page, size, status, search, null);
    }

    public PaginatedResponse<AssetDTO> getAll(int page, int size, String status, String search, Long employeeId) {
        var items = assetRepository.findAllPaginated(page, size, status, null, search, employeeId)
            .stream()
            .map(assetMapper::toDTO)
            .toList();

        long total = assetRepository.countWithFilters(status, null, search, employeeId);

        return new PaginatedResponse<>(items, total, page, size);
    }

    public PaginatedResponse<AssetDTO> getAllByEmployee(int page, int size, String status, String search, Long employeeId) {
        return getAll(page, size, status, search, employeeId);
    }

    public PaginatedResponse<AssetDTO> getAllByDepartment(int page, int size, String status, String search, Long departmentId) {
        var items = assetRepository.findAllByDepartment(page, size, status, search, departmentId)
            .stream()
            .map(assetMapper::toDTO)
            .toList();

        long total = assetRepository.countByDepartment(status, search, departmentId);

        return new PaginatedResponse<>(items, total, page, size);
    }

    @Override
    public Optional<AssetDTO> update(Long id, AssetDTO assetDTO) {
        return assetRepository.findById(id)
            .map(existingAsset -> {
                Asset updatedAsset = assetMapper.updateEntity(existingAsset, assetDTO);
                Asset saved = assetRepository.save(updatedAsset);
                return assetMapper.toDTO(saved);
            });
    }

    @Override
    public boolean delete(Long id) {
        if (assetRepository.existsById(id)) {
            assetRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
