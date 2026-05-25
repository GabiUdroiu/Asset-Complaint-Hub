package com.draxlmaier.hub.repository;

import com.draxlmaier.hub.model.Announcement;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;

@Stateless
public class AnnouncementRepository {

    @PersistenceContext
    private EntityManager em;

    public Announcement save(Announcement announcement) {
        if (announcement.getId() == null) {
            em.persist(announcement);
            return announcement;
        } else {
            return em.merge(announcement);
        }
    }

    public Optional<Announcement> findById(Long id) {
        return Optional.ofNullable(em.find(Announcement.class, id));
    }

    public List<Announcement> findAll() {
        TypedQuery<Announcement> query = em.createQuery(
            "SELECT a FROM Announcement a ORDER BY a.announcementDate DESC",
            Announcement.class);
        return query.getResultList();
    }

    public List<Announcement> findRecent(int limit) {
        TypedQuery<Announcement> query = em.createQuery(
            "SELECT a FROM Announcement a ORDER BY a.announcementDate DESC",
            Announcement.class);
        query.setMaxResults(limit);
        return query.getResultList();
    }

    public void delete(Long id) {
        Optional<Announcement> announcement = findById(id);
        announcement.ifPresent(em::remove);
    }
}
