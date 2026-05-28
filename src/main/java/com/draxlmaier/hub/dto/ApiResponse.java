package com.draxlmaier.hub.dto;

public record ApiResponse<T>(
    String message,
    T data
) {}
