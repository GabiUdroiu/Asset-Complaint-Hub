package com.draxlmaier.hub.dto;

public record ErrorResponse(
    String message,
    String error,
    long timestamp
) {
    public ErrorResponse(String message, String error) {
        this(message, error, System.currentTimeMillis());
    }
}
