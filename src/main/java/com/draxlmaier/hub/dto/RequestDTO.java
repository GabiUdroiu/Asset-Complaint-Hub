package com.draxlmaier.hub.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RequestDTO(
    Long id,
    @NotBlank(message = "Title cannot be blank")
    String title,
    @NotBlank(message = "Description cannot be blank")
    String description,
    @NotBlank(message = "Status cannot be blank")
    String status,
    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime createdAt,
    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime updatedAt,
    @NotNull(message = "Employee ID cannot be null")
    Long employeeId,
    String employeeName,
    String departmentName,
    Long assetId,
    Long acceptedBy,
    String acceptedByName,
    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime acceptedAt,
    Long lockedById,
    String lockedByName,
    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime lockedAt,
    Long version
) {}
