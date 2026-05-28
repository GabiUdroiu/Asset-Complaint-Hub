package com.draxlmaier.hub.mapper;

import com.draxlmaier.hub.dto.EmployeeDTO;
import com.draxlmaier.hub.model.Employee;
import com.draxlmaier.hub.model.Role;
import com.draxlmaier.hub.repository.RoleRepository;
import com.draxlmaier.hub.repository.DepartmentRepository;
import jakarta.ejb.Singleton;
import jakarta.inject.Inject;

@Singleton
public class EmployeeMapper {

    @Inject
    private RoleRepository roleRepository;

    @Inject
    private DepartmentRepository departmentRepository;

    public EmployeeDTO toDTO(Employee entity) {
        if (entity == null) return null;

        return new EmployeeDTO(
            entity.getId(),
            entity.getName(),
            entity.getEmail(),
            entity.getRole() != null ? entity.getRole().getName() : null,
            entity.getDepartment() != null ? entity.getDepartment().getId() : null,
            entity.getDepartment() != null ? entity.getDepartment().getName() : null
        );
    }

    public Employee toEntity(EmployeeDTO dto) {
        if (dto == null) return null;

        Role role = null;
        if (dto.role() != null) {
            role = roleRepository.findByName(dto.role());
        }
        if (role == null) {
            role = roleRepository.findByName("USER");
        }

        Employee employee = Employee.builder()
            .name(dto.name())
            .email(dto.email())
            .role(role)
            .build();

        if (dto.departmentId() != null) {
            departmentRepository.findById(dto.departmentId()).ifPresent(employee::setDepartment);
        } else {
            departmentRepository.findAll().stream().findFirst().ifPresent(employee::setDepartment);
        }

        return employee;
    }

    public Employee updateEntity(Employee existing, EmployeeDTO dto) {
        if (dto == null) return existing;

        if (dto.name() != null) {
            existing.setName(dto.name());
        }
        if (dto.email() != null) {
            existing.setEmail(dto.email());
        }
        if (dto.role() != null) {
            Role role = roleRepository.findByName(dto.role());
            if (role != null) {
                existing.setRole(role);
            }
        }

        return existing;
    }
}
