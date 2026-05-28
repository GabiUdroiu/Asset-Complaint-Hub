package com.draxlmaier.hub.mapper;

import com.draxlmaier.hub.dto.ComplaintWorkflowDTO;
import com.draxlmaier.hub.model.ComplaintWorkflow;
import com.draxlmaier.hub.model.Complaint;
import jakarta.ejb.Singleton;

@Singleton
public class ComplaintWorkflowMapper {

    public ComplaintWorkflowDTO toDTO(ComplaintWorkflow workflow) {
        return new ComplaintWorkflowDTO(
            workflow.getId(),
            workflow.getComplaint().getId(),
            workflow.getEmployee().getId(),
            workflow.getOldStatus() != null ? workflow.getOldStatus().toString() : null,
            workflow.getCurrentStatus().toString(),
            workflow.getChangedAt(),
            workflow.getReason()
        );
    }

    public ComplaintWorkflow toEntity(ComplaintWorkflowDTO dto) {
        return ComplaintWorkflow.builder()
            .id(dto.id())
            .oldStatus(dto.oldStatus() != null ? Complaint.Status.valueOf(dto.oldStatus()) : null)
            .currentStatus(Complaint.Status.valueOf(dto.currentStatus()))
            .changedAt(dto.changedAt())
            .reason(dto.reason())
            .build();
    }
}
