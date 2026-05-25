package com.draxlmaier.hub.dto;

import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record NotificationDTO(
    Long id,
    Long userId,
    String type,
    String message,
    String data,
    LocalDateTime createdAt,
    boolean read
) {}
