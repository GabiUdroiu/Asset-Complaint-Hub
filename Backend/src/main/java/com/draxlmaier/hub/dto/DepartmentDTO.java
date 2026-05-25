package com.draxlmaier.hub.dto;

public record DepartmentDTO(
    Long id,
    String name,
    Long responsibleEmployeeId,
    String responsibleEmployeeName
) {}
