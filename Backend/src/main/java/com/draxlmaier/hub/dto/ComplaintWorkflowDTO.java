package com.draxlmaier.hub.dto;

import java.time.LocalDateTime;

public record ComplaintWorkflowDTO(
    Long id,
    Long complaintId,
    Long employeeId,
    String oldStatus,
    String currentStatus,
    LocalDateTime changedAt,
    String reason
) {}
