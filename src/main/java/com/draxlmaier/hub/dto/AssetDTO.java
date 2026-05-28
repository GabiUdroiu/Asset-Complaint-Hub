package com.draxlmaier.hub.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AssetDTO(
    Long id,
    @NotBlank(message = "Asset name cannot be blank")
    String name,
    @NotBlank(message = "Serial number cannot be blank")
    String serialNumber,
    String category,
    String status,
    LocalDateTime lastUpdated,
    Long employeeId,
    String employeeName,
    String departmentName,
    Long version
) {}
