package com.draxlmaier.hub.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record EmployeeDTO(
    Long id,
    String name,
    String email,
    String role,
    Long departmentId,
    String departmentName
) {}
