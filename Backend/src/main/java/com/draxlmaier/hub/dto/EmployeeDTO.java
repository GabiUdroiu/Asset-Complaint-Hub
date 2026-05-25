package com.draxlmaier.hub.dto;

public record EmployeeDTO(
    Long id,
    String name,
    String email,
    String role,
    Long departmentId,
    String departmentName
) {}
