package com.draxlmaier.hub.service;

import com.draxlmaier.hub.dto.EmployeeDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.mapper.EmployeeMapper;
import com.draxlmaier.hub.model.Employee;
import com.draxlmaier.hub.repository.EmployeeRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Optional;

@Stateless
@Transactional
public class EmployeeService implements IService<Employee, EmployeeDTO> {

    @Inject
    private EmployeeRepository employeeRepository;

    @Inject
    private EmployeeMapper employeeMapper;

    @Override
    public EmployeeDTO create(EmployeeDTO employeeDTO) {
        Employee employee = employeeMapper.toEntity(employeeDTO);
        Employee saved = employeeRepository.save(employee);
        return employeeMapper.toDTO(saved);
    }

    @Override
    public Optional<EmployeeDTO> get(Long id) {
        return employeeRepository.findById(id)
            .map(employeeMapper::toDTO);
    }

    @Override
    public PaginatedResponse<EmployeeDTO> getAll(int page, int size, String status, String search) {
        var items = employeeRepository.findAllPaginated(page, size, status, search)
            .stream()
            .map(employeeMapper::toDTO)
            .toList();

        long total = employeeRepository.countWithFilters(status, search);

        return new PaginatedResponse<>(items, total, page, size);
    }

    @Override
    public PaginatedResponse<EmployeeDTO> getAllByEmployee(int page, int size, String status, String search, Long employeeId) {
        throw new UnsupportedOperationException("Employees do not support employee filtering");
    }

    @Override
    public Optional<EmployeeDTO> update(Long id, EmployeeDTO employeeDTO) {
        return employeeRepository.findById(id)
            .map(existing -> {
                Employee updated = employeeMapper.updateEntity(existing, employeeDTO);
                Employee saved = employeeRepository.save(updated);
                return employeeMapper.toDTO(saved);
            });
    }

    @Override
    public boolean delete(Long id) {
        if (employeeRepository.existsById(id)) {
            employeeRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
