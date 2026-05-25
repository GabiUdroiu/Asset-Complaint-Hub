package com.draxlmaier.hub.service;

import com.draxlmaier.hub.controller.NotificationController;
import com.draxlmaier.hub.dto.NotificationDTO;
import com.draxlmaier.hub.model.Notification;
import com.draxlmaier.hub.repository.NotificationRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
@Transactional
public class NotificationService {

    @Inject
    private NotificationRepository notificationRepository;

    public NotificationDTO create(Long userId, String type, String message, String data) {
        Notification notification = Notification.builder()
            .userId(userId)
            .type(type)
            .message(message)
            .data(data)
            .build();
        Notification saved = notificationRepository.save(notification);

        // Push via SSE to connected user
        NotificationController.sendNotification(userId, type, message);

        return toDTO(saved);
    }

    public void broadcast(String type, String message, String data) {
        // SSE push to all connected users
        NotificationController.sendNotificationToAll(type, message);
    }

    public List<NotificationDTO> getForUser(Long userId) {
        return notificationRepository.findByUserId(userId)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public void markAsRead(Long id) {
        notificationRepository.markAsRead(id);
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }

    public void deleteAll(Long userId) {
        notificationRepository.deleteAllByUserId(userId);
    }

    public long countUnread(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
            .id(n.getId())
            .userId(n.getUserId())
            .type(n.getType())
            .message(n.getMessage())
            .data(n.getData())
            .createdAt(n.getCreatedAt())
            .read(n.isRead())
            .build();
    }
}
