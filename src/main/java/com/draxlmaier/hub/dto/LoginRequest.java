package com.draxlmaier.hub.dto;

public record LoginRequest(
    String email,
    String password
) {}
