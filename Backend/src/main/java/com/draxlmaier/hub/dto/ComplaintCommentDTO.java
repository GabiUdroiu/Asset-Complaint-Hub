package com.draxlmaier.hub.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public record ComplaintCommentDTO(
    Long id,
    Long complaintId,
    Long employeeId,
    String text,
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime createdAt
) {}
