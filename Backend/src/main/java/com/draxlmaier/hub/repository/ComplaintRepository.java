package com.draxlmaier.hub.repository;

import com.draxlmaier.hub.model.Complaint;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;

@Stateless
public class ComplaintRepository {

    @PersistenceContext
    private EntityManager em;

    public Complaint save(Complaint complaint) {
        if (complaint.getId() == null) {
            em.persist(complaint);
            return complaint;
        } else {
            return em.merge(complaint);
        }
    }

    public Optional<Complaint> findById(Long id) {
        return Optional.ofNullable(em.find(Complaint.class, id));
    }

    public List<Complaint> findAll() {
        return em.createQuery("SELECT c FROM Complaint c", Complaint.class).getResultList();
    }

    public List<Complaint> findAllPaginated(int page, int size, String status, String search) {
        StringBuilder jpql = new StringBuilder("SELECT c FROM Complaint c WHERE 1=1");

        if (status != null && !status.isEmpty()) {
            jpql.append(" AND c.status = :status");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(c.title) LIKE LOWER(:search) OR LOWER(c.description) LIKE LOWER(:search))");
        }

        TypedQuery<Complaint> query = em.createQuery(jpql.toString(), Complaint.class);

        if (status != null && !status.isEmpty()) {
            query.setParameter("status", Complaint.Status.valueOf(status));
        }
        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        query.setFirstResult(page * size);
        query.setMaxResults(size);

        return query.getResultList();
    }

    public long countWithFilters(String status, String search) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(c) FROM Complaint c WHERE 1=1");

        if (status != null && !status.isEmpty()) {
            jpql.append(" AND c.status = :status");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(c.title) LIKE LOWER(:search) OR LOWER(c.description) LIKE LOWER(:search))");
        }

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);

        if (status != null && !status.isEmpty()) {
            query.setParameter("status", Complaint.Status.valueOf(status));
        }
        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        return query.getSingleResult();
    }

    public void deleteById(Long id) {
        findById(id).ifPresent(em::remove);
    }

    public boolean existsById(Long id) {
        return findById(id).isPresent();
    }

    public List<Complaint> findAllByEmployeePaginated(int page, int size, String status, String search, Long employeeId) {
        StringBuilder jpql = new StringBuilder("SELECT c FROM Complaint c WHERE c.employee.id = :employeeId");

        if (status != null && !status.isEmpty()) {
            jpql.append(" AND c.status = :status");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(c.title) LIKE LOWER(:search) OR LOWER(c.description) LIKE LOWER(:search))");
        }

        TypedQuery<Complaint> query = em.createQuery(jpql.toString(), Complaint.class);
        query.setParameter("employeeId", employeeId);

        if (status != null && !status.isEmpty()) {
            query.setParameter("status", Complaint.Status.valueOf(status));
        }
        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        query.setFirstResult(page * size);
        query.setMaxResults(size);

        return query.getResultList();
    }

    public long countByEmployee(String status, String search, Long employeeId) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(c) FROM Complaint c WHERE c.employee.id = :employeeId");

        if (status != null && !status.isEmpty()) {
            jpql.append(" AND c.status = :status");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(c.title) LIKE LOWER(:search) OR LOWER(c.description) LIKE LOWER(:search))");
        }

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);
        query.setParameter("employeeId", employeeId);

        if (status != null && !status.isEmpty()) {
            query.setParameter("status", Complaint.Status.valueOf(status));
        }
        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        return query.getSingleResult();
    }
}
