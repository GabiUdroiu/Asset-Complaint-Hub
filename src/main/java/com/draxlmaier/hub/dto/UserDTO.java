package com.draxlmaier.hub.dto;

public record UserDTO(
    Long id,
    String email,
    String name,
    Long departmentId,
    String department,
    String role
) {}
