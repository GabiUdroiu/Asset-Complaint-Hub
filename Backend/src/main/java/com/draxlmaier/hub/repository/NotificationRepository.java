package com.draxlmaier.hub.repository;

import com.draxlmaier.hub.model.Notification;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;

@Stateless
public class NotificationRepository {

    @PersistenceContext
    private EntityManager em;

    public Notification save(Notification notification) {
        if (notification.getId() == null) {
            em.persist(notification);
            return notification;
        }
        return em.merge(notification);
    }

    public Optional<Notification> findById(Long id) {
        return Optional.ofNullable(em.find(Notification.class, id));
    }

    public List<Notification> findByUserId(Long userId) {
        return em.createQuery(
            "SELECT n FROM Notification n WHERE n.userId = :userId ORDER BY n.createdAt DESC",
            Notification.class)
            .setParameter("userId", userId)
            .getResultList();
    }

    public List<Notification> findUnreadByUserId(Long userId) {
        return em.createQuery(
            "SELECT n FROM Notification n WHERE n.userId = :userId AND n.read = false ORDER BY n.createdAt DESC",
            Notification.class)
            .setParameter("userId", userId)
            .getResultList();
    }

    public void markAsRead(Long id) {
        findById(id).ifPresent(n -> {
            n.setRead(true);
            em.merge(n);
        });
    }

    public void markAllAsReadForUser(Long userId) {
        em.createQuery("UPDATE Notification n SET n.read = true WHERE n.userId = :userId")
            .setParameter("userId", userId)
            .executeUpdate();
    }

    public void deleteById(Long id) {
        findById(id).ifPresent(em::remove);
    }

    public void deleteAllByUserId(Long userId) {
        em.createQuery("DELETE FROM Notification n WHERE n.userId = :userId")
            .setParameter("userId", userId)
            .executeUpdate();
    }

    public long countUnreadByUserId(Long userId) {
        return em.createQuery(
            "SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.read = false",
            Long.class)
            .setParameter("userId", userId)
            .getSingleResult();
    }
}
