package com.draxlmaier.hub.dto;

public record UserDTO(
    Long id,
    String email,
    String name,
    String department,
    String role
) {}
