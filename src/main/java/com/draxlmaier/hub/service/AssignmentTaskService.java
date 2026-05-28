package com.draxlmaier.hub.service;

import com.draxlmaier.hub.dto.AssignmentTaskDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.model.AssignmentTask;
import com.draxlmaier.hub.repository.AssignmentTaskRepository;
import com.draxlmaier.hub.mapper.AssignmentTaskMapper;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Stateless
@Transactional
public class AssignmentTaskService {

    @Inject
    private AssignmentTaskRepository assignmentTaskRepository;

    @Inject
    private AssignmentTaskMapper assignmentTaskMapper;

    public AssignmentTaskDTO create(AssignmentTaskDTO dto) {
        AssignmentTask task = assignmentTaskMapper.toEntity(dto);
        AssignmentTask saved = assignmentTaskRepository.save(task);
        return assignmentTaskMapper.toDTO(saved);
    }

    public Optional<AssignmentTaskDTO> get(Long id) {
        return assignmentTaskRepository.findById(id).map(assignmentTaskMapper::toDTO);
    }

    public PaginatedResponse<AssignmentTaskDTO> getAll(int page, int size, String sortBy, String sortOrder) {
        List<AssignmentTask> allTasks = assignmentTaskRepository.findAll();

        int totalItems = allTasks.size();
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, totalItems);

        List<AssignmentTaskDTO> items = allTasks.subList(startIndex, endIndex)
            .stream()
            .map(assignmentTaskMapper::toDTO)
            .collect(Collectors.toList());

        return new PaginatedResponse<AssignmentTaskDTO>(
            items,
            totalItems,
            page,
            size
        );
    }

    public Optional<AssignmentTaskDTO> update(Long id, AssignmentTaskDTO dto) {
        Optional<AssignmentTask> task = assignmentTaskRepository.findById(id);
        if (task.isPresent()) {
            assignmentTaskMapper.updateEntity(dto, task.get());
            AssignmentTask updated = assignmentTaskRepository.update(task.get());
            return Optional.of(assignmentTaskMapper.toDTO(updated));
        }
        return Optional.empty();
    }

    public boolean delete(Long id) {
        return assignmentTaskRepository.delete(id);
    }

    public Optional<AssignmentTaskDTO> getByItemTypeAndItemId(String itemType, Long itemId) {
        return assignmentTaskRepository.findByItemTypeAndItemId(itemType, itemId)
            .map(assignmentTaskMapper::toDTO);
    }

    public PaginatedResponse<AssignmentTaskDTO> getByItemType(String itemType, int page, int size) {
        List<AssignmentTask> tasks = assignmentTaskRepository.findByItemType(itemType);

        int totalItems = tasks.size();
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, totalItems);

        List<AssignmentTaskDTO> items = tasks.subList(startIndex, endIndex)
            .stream()
            .map(assignmentTaskMapper::toDTO)
            .collect(Collectors.toList());

        return new PaginatedResponse<AssignmentTaskDTO>(
            items,
            totalItems,
            page,
            size
        );
    }

    public PaginatedResponse<AssignmentTaskDTO> getByAcceptedBy(Long acceptedBy, int page, int size) {
        List<AssignmentTask> tasks = assignmentTaskRepository.findByAcceptedBy(acceptedBy);

        int totalItems = tasks.size();
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, totalItems);

        List<AssignmentTaskDTO> items = tasks.subList(startIndex, endIndex)
            .stream()
            .map(assignmentTaskMapper::toDTO)
            .collect(Collectors.toList());

        return new PaginatedResponse<AssignmentTaskDTO>(
            items,
            totalItems,
            page,
            size
        );
    }
}
