package com.draxlmaier.hub.dto;

public record AuthResponse(
    String token,
    String refreshToken,
    UserDTO user,
    Long expiresIn
) {}
