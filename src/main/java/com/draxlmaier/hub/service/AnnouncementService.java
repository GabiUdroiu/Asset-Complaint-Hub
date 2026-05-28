package com.draxlmaier.hub.service;

import com.draxlmaier.hub.controller.NotificationController;
import com.draxlmaier.hub.dto.AnnouncementDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.mapper.AnnouncementMapper;
import com.draxlmaier.hub.model.Announcement;
import com.draxlmaier.hub.repository.AnnouncementRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Stateless
@Transactional
public class AnnouncementService implements IService<Announcement, AnnouncementDTO> {

    @Inject
    private AnnouncementRepository announcementRepository;

    @Inject
    private AnnouncementMapper announcementMapper;

    @Override
    public AnnouncementDTO create(AnnouncementDTO announcementDTO) {
        Announcement announcement = announcementMapper.toEntity(announcementDTO);
        announcement.setCreatedAt(LocalDateTime.now());
        announcement.setUpdatedAt(LocalDateTime.now());
        if (announcement.getAnnouncementDate() == null) {
            announcement.setAnnouncementDate(LocalDateTime.now());
        }
        Announcement saved = announcementRepository.save(announcement);
        AnnouncementDTO result = announcementMapper.toDTO(saved);

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            String json = objectMapper.writeValueAsString(result);
            NotificationController.sendNotificationToAll("announcement", json);
        } catch (Exception e) {
            // Log error but don't fail the request
        }

        return result;
    }

    @Override
    public Optional<AnnouncementDTO> get(Long id) {
        return announcementRepository.findById(id)
            .map(announcementMapper::toDTO);
    }

    @Override
    public PaginatedResponse<AnnouncementDTO> getAll(int page, int size, String status, String category, String search) {
        List<Announcement> announcements = announcementRepository.findAll();

        List<AnnouncementDTO> items = announcements.stream()
            .skip((long) page * size)
            .limit(size)
            .map(announcementMapper::toDTO)
            .toList();

        return new PaginatedResponse<>(items, announcements.size(), page, size);
    }

    @Override
    public PaginatedResponse<AnnouncementDTO> getAllByEmployee(int page, int size, String status, String category, String search, Long employeeId) {
        throw new UnsupportedOperationException("Announcements do not support employee filtering");
    }

    @Override
    public PaginatedResponse<AnnouncementDTO> getAllByDepartment(int page, int size, String status, String search, Long departmentId) {
        throw new UnsupportedOperationException("Announcements do not support department filtering");
    }

    public List<AnnouncementDTO> getRecent(int limit) {
        return announcementRepository.findRecent(limit).stream()
            .map(announcementMapper::toDTO)
            .toList();
    }

    @Override
    public Optional<AnnouncementDTO> update(Long id, AnnouncementDTO announcementDTO) {
        return announcementRepository.findById(id)
            .map(existing -> {
                Announcement updated = announcementMapper.updateEntity(existing, announcementDTO);
                updated.setUpdatedAt(LocalDateTime.now());
                Announcement saved = announcementRepository.save(updated);
                return announcementMapper.toDTO(saved);
            });
    }

    @Override
    public boolean delete(Long id) {
        if (announcementRepository.findById(id).isPresent()) {
            announcementRepository.delete(id);
            return true;
        }
        return false;
    }
}
