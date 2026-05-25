package com.draxlmaier.hub.repository;

import com.draxlmaier.hub.model.AssignmentTask;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;

@Stateless
public class AssignmentTaskRepository {

    @PersistenceContext
    private EntityManager em;

    public AssignmentTask save(AssignmentTask task) {
        em.persist(task);
        return task;
    }

    public Optional<AssignmentTask> findById(Long id) {
        return Optional.ofNullable(em.find(AssignmentTask.class, id));
    }

    public List<AssignmentTask> findAll() {
        return em.createQuery("SELECT t FROM AssignmentTask t ORDER BY t.acceptedAt DESC", AssignmentTask.class)
                .getResultList();
    }

    public AssignmentTask update(AssignmentTask task) {
        return em.merge(task);
    }

    public boolean delete(Long id) {
        Optional<AssignmentTask> task = findById(id);
        if (task.isPresent()) {
            em.remove(em.merge(task.get()));
            return true;
        }
        return false;
    }

    public Optional<AssignmentTask> findByItemTypeAndItemId(String itemType, Long itemId) {
        List<AssignmentTask> results = em.createQuery(
                "SELECT t FROM AssignmentTask t WHERE t.itemType = :itemType AND t.itemId = :itemId ORDER BY t.acceptedAt DESC",
                AssignmentTask.class)
            .setParameter("itemType", itemType)
            .setParameter("itemId", itemId)
            .setMaxResults(1)
            .getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public List<AssignmentTask> findByItemType(String itemType) {
        return em.createQuery("SELECT t FROM AssignmentTask t WHERE t.itemType = :itemType ORDER BY t.acceptedAt DESC", AssignmentTask.class)
            .setParameter("itemType", itemType)
            .getResultList();
    }

    public List<AssignmentTask> findByAcceptedBy(Long acceptedBy) {
        return em.createQuery("SELECT t FROM AssignmentTask t WHERE t.acceptedBy = :acceptedBy ORDER BY t.acceptedAt DESC", AssignmentTask.class)
            .setParameter("acceptedBy", acceptedBy)
            .getResultList();
    }
}
