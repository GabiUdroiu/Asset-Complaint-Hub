package com.draxlmaier.hub.repository;

import com.draxlmaier.hub.model.ComplaintWorkflow;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;

@Stateless
public class ComplaintWorkflowRepository {
    
    @PersistenceContext
    private EntityManager em;
    
    public ComplaintWorkflow save(ComplaintWorkflow workflow) {
        if (workflow.getId() == null) {
            em.persist(workflow);
            return workflow;
        } else {
            return em.merge(workflow);
        }
    }
    
    public Optional<ComplaintWorkflow> findById(Long id) {
        return Optional.ofNullable(em.find(ComplaintWorkflow.class, id));
    }
    
    public List<ComplaintWorkflow> findAll() {
        return em.createQuery("SELECT cw FROM ComplaintWorkflow cw", ComplaintWorkflow.class).getResultList();
    }
    
    public void deleteById(Long id) {
        findById(id).ifPresent(em::remove);
    }
    
    public boolean existsById(Long id) {
        return findById(id).isPresent();
    }

    public List<ComplaintWorkflow> findByComplaintId(Long complaintId) {
        return em.createQuery(
            "SELECT cw FROM ComplaintWorkflow cw WHERE cw.complaint.id = :complaintId ORDER BY cw.changedAt DESC",
            ComplaintWorkflow.class)
            .setParameter("complaintId", complaintId)
            .getResultList();
    }
}
