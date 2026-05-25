package com.draxlmaier.hub.service;

import com.draxlmaier.hub.dto.ComplaintCommentDTO;
import com.draxlmaier.hub.mapper.ComplaintCommentMapper;
import com.draxlmaier.hub.model.Complaint;
import com.draxlmaier.hub.model.ComplaintComment;
import com.draxlmaier.hub.model.Employee;
import com.draxlmaier.hub.repository.ComplaintCommentRepository;
import com.draxlmaier.hub.repository.ComplaintRepository;
import com.draxlmaier.hub.repository.EmployeeRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Stateless
@Transactional
public class ComplaintCommentService {

    @Inject
    private ComplaintCommentRepository commentRepository;

    @Inject
    private ComplaintCommentMapper commentMapper;

    @Inject
    private ComplaintRepository complaintRepository;

    @Inject
    private EmployeeRepository employeeRepository;

    public ComplaintCommentDTO create(Long complaintId, Long employeeId, ComplaintCommentDTO commentDTO) {
        Optional<Complaint> complaint = complaintRepository.findById(complaintId);
        Optional<Employee> employee = employeeRepository.findById(employeeId);

        if (complaint.isPresent() && employee.isPresent()) {
            ComplaintComment comment = ComplaintComment.builder()
                .complaint(complaint.get())
                .employee(employee.get())
                .text(commentDTO.text())
                .createdAt(LocalDateTime.now())
                .build();
            ComplaintComment saved = commentRepository.save(comment);
            return commentMapper.toDTO(saved);
        }
        return null;
    }

    public List<ComplaintCommentDTO> getCommentsByComplaint(Long complaintId) {
        return commentRepository.findByComplaintId(complaintId)
            .stream()
            .map(commentMapper::toDTO)
            .toList();
    }

    public Optional<ComplaintCommentDTO> getComment(Long id) {
        return commentRepository.findById(id)
            .map(commentMapper::toDTO);
    }

    public boolean deleteComment(Long id) {
        if (commentRepository.existsById(id)) {
            commentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
