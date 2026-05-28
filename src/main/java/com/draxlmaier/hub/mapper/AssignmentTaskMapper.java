package com.draxlmaier.hub.mapper;

import com.draxlmaier.hub.dto.AssignmentTaskDTO;
import com.draxlmaier.hub.model.Complaint;
import com.draxlmaier.hub.model.Request;
import com.draxlmaier.hub.model.AssignmentTask;
import com.draxlmaier.hub.repository.ComplaintRepository;
import com.draxlmaier.hub.repository.RequestRepository;
import com.draxlmaier.hub.repository.EmployeeRepository;

import jakarta.ejb.Singleton;
import jakarta.inject.Inject;
import java.util.Optional;

@Singleton
public class AssignmentTaskMapper {

    @Inject
    private ComplaintRepository complaintRepository;

    @Inject
    private RequestRepository requestRepository;

    @Inject
    private EmployeeRepository employeeRepository;

    public AssignmentTaskDTO toDTO(AssignmentTask task) {
        String itemTitle = getItemTitle(task.getItemType(), task.getItemId());
        String acceptedByName = employeeRepository.findById(task.getAcceptedBy())
            .map(e -> e.getName())
            .orElse("Unknown");

        return AssignmentTaskDTO.builder()
            .id(task.getId())
            .itemType(task.getItemType())
            .itemId(task.getItemId())
            .acceptedBy(task.getAcceptedBy())
            .acceptedAt(task.getAcceptedAt())
            .status(task.getStatus())
            .acceptedByName(acceptedByName)
            .itemTitle(itemTitle)
            .build();
    }

    public AssignmentTask toEntity(AssignmentTaskDTO dto) {
        AssignmentTask task = new AssignmentTask();
        task.setId(dto.id());
        task.setItemType(dto.itemType());
        task.setItemId(dto.itemId());
        task.setAcceptedBy(dto.acceptedBy());
        task.setAcceptedAt(dto.acceptedAt());
        task.setStatus(dto.status());
        return task;
    }

    public void updateEntity(AssignmentTaskDTO dto, AssignmentTask task) {
        task.setStatus(dto.status());
    }

    private String getItemTitle(String itemType, Long itemId) {
        if ("COMPLAINT".equals(itemType)) {
            Optional<Complaint> complaint = complaintRepository.findById(itemId);
            return complaint.map(Complaint::getTitle).orElse("Complaint #" + itemId);
        } else if ("REQUEST".equals(itemType)) {
            Optional<Request> request = requestRepository.findById(itemId);
            return request.map(Request::getTitle).orElse("Request #" + itemId);
        }
        return "Unknown Item";
    }
}
