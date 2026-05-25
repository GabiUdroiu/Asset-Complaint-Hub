package com.draxlmaier.hub.mapper;

import com.draxlmaier.hub.dto.ComplaintCommentDTO;
import com.draxlmaier.hub.model.ComplaintComment;
import jakarta.ejb.Singleton;

@Singleton
public class ComplaintCommentMapper {

    public ComplaintCommentDTO toDTO(ComplaintComment entity) {
        if (entity == null) return null;

        return new ComplaintCommentDTO(
            entity.getId(),
            entity.getComplaint() != null ? entity.getComplaint().getId() : null,
            entity.getEmployee() != null ? entity.getEmployee().getId() : null,
            entity.getText(),
            entity.getCreatedAt()
        );
    }

    public ComplaintComment toEntity(ComplaintCommentDTO dto) {
        if (dto == null) return null;

        return ComplaintComment.builder()
            .text(dto.text())
            .build();
    }
}
