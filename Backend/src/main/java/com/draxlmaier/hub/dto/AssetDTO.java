package com.draxlmaier.hub.dto;

import java.time.LocalDateTime;

public record AssetDTO(
    Long id,
    String name,
    String serialNumber,
    String category,
    String status,
    LocalDateTime lastUpdated,
    Long employeeId,
    String employeeName,
    String departmentName
) {}
