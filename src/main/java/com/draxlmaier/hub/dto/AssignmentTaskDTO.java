package com.draxlmaier.hub.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
@Builder
public record AssignmentTaskDTO(
    Long id,
    String itemType,
    Long itemId,
    Long acceptedBy,
    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime acceptedAt,
    String status,
    String acceptedByName,
    String itemTitle
) {}
