package com.draxlmaier.hub.dto;

import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record AssignmentTaskDTO(
    Long id,
    String itemType,
    Long itemId,
    Long acceptedBy,
    LocalDateTime acceptedAt,
    String status,
    String acceptedByName,
    String itemTitle
) {}
