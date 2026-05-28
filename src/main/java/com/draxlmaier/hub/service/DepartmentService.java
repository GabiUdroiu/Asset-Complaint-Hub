package com.draxlmaier.hub.service;

import com.draxlmaier.hub.dto.DepartmentDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.mapper.DepartmentMapper;
import com.draxlmaier.hub.model.Department;
import com.draxlmaier.hub.repository.DepartmentRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Optional;

@Stateless
@Transactional
public class DepartmentService implements IService<Department, DepartmentDTO> {

    @Inject
    private DepartmentRepository departmentRepository;

    @Inject
    private DepartmentMapper departmentMapper;

    @Override
    public DepartmentDTO create(DepartmentDTO departmentDTO) {
        Department department = departmentMapper.toEntity(departmentDTO);
        Department saved = departmentRepository.save(department);
        return departmentMapper.toDTO(saved);
    }

    @Override
    public Optional<DepartmentDTO> get(Long id) {
        return departmentRepository.findById(id)
            .map(departmentMapper::toDTO);
    }

    @Override
    public PaginatedResponse<DepartmentDTO> getAll(int page, int size, String status, String category, String search) {
        var items = departmentRepository.findAllPaginated(page, size, search)
            .stream()
            .map(departmentMapper::toDTO)
            .toList();

        long total = departmentRepository.countWithFilters(search);

        return new PaginatedResponse<>(items, total, page, size);
    }

    @Override
    public PaginatedResponse<DepartmentDTO> getAllByEmployee(int page, int size, String status, String category, String search, Long employeeId) {
        throw new UnsupportedOperationException("Departments do not support employee filtering");
    }

    @Override
    public PaginatedResponse<DepartmentDTO> getAllByDepartment(int page, int size, String status, String search, Long departmentId) {
        throw new UnsupportedOperationException("Departments do not support department filtering");
    }

    @Override
    public Optional<DepartmentDTO> update(Long id, DepartmentDTO departmentDTO) {
        return departmentRepository.findById(id)
            .map(existing -> {
                Department updated = departmentMapper.updateEntity(existing, departmentDTO);
                Department saved = departmentRepository.save(updated);
                return departmentMapper.toDTO(saved);
            });
    }

    @Override
    public boolean delete(Long id) {
        if (!departmentRepository.existsById(id)) {
            return false;
        }
        try {
            departmentRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
