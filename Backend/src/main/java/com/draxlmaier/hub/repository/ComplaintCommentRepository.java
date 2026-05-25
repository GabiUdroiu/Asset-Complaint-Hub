package com.draxlmaier.hub.repository;

import com.draxlmaier.hub.model.ComplaintComment;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;

@Stateless
public class ComplaintCommentRepository {
    
    @PersistenceContext
    private EntityManager em;
    
    public ComplaintComment save(ComplaintComment comment) {
        if (comment.getId() == null) {
            em.persist(comment);
            return comment;
        } else {
            return em.merge(comment);
        }
    }
    
    public Optional<ComplaintComment> findById(Long id) {
        return Optional.ofNullable(em.find(ComplaintComment.class, id));
    }
    
    public List<ComplaintComment> findAll() {
        return em.createQuery("SELECT cc FROM ComplaintComment cc", ComplaintComment.class).getResultList();
    }

    public List<ComplaintComment> findByComplaintId(Long complaintId) {
        return em.createQuery(
            "SELECT cc FROM ComplaintComment cc WHERE cc.complaint.id = :complaintId ORDER BY cc.createdAt DESC",
            ComplaintComment.class
        ).setParameter("complaintId", complaintId).getResultList();
    }

    public void deleteById(Long id) {
        findById(id).ifPresent(em::remove);
    }

    public boolean existsById(Long id) {
        return findById(id).isPresent();
    }
}
