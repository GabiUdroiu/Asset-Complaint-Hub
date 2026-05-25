package com.draxlmaier.hub.repository;

import com.draxlmaier.hub.model.Request;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;

@Stateless
public class RequestRepository {

    @PersistenceContext
    private EntityManager em;

    public Request save(Request request) {
        if (request.getId() == null) {
            em.persist(request);
            return request;
        } else {
            return em.merge(request);
        }
    }

    public Optional<Request> findById(Long id) {
        return Optional.ofNullable(em.find(Request.class, id));
    }

    public List<Request> findAll() {
        return em.createQuery("SELECT r FROM Request r", Request.class).getResultList();
    }

    public List<Request> findAllPaginated(int page, int size, String status, String search) {
        return findAllPaginated(page, size, status, search, "createdAt", "DESC");
    }

    public List<Request> findAllPaginated(int page, int size, String status, String search, String sortBy, String sortOrder) {
        StringBuilder jpql = new StringBuilder("SELECT r FROM Request r WHERE 1=1");

        if (status != null && !status.isEmpty()) {
            jpql.append(" AND r.status = :status");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(r.title) LIKE LOWER(:search) OR LOWER(r.description) LIKE LOWER(:search))");
        }

        jpql.append(" ORDER BY r.").append(sortBy).append(" ").append(sortOrder);

        TypedQuery<Request> query = em.createQuery(jpql.toString(), Request.class);

        if (status != null && !status.isEmpty()) {
            query.setParameter("status", Request.Status.valueOf(status));
        }
        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        query.setFirstResult(page * size);
        query.setMaxResults(size);

        return query.getResultList();
    }

    public long countWithFilters(String status, String search) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(r) FROM Request r WHERE 1=1");

        if (status != null && !status.isEmpty()) {
            jpql.append(" AND r.status = :status");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(r.title) LIKE LOWER(:search) OR LOWER(r.description) LIKE LOWER(:search))");
        }

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);

        if (status != null && !status.isEmpty()) {
            query.setParameter("status", Request.Status.valueOf(status));
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

    public List<Request> findAllByEmployeePaginated(int page, int size, String status, String search, Long employeeId) {
        StringBuilder jpql = new StringBuilder("SELECT r FROM Request r WHERE r.employee.id = :employeeId");

        if (status != null && !status.isEmpty()) {
            jpql.append(" AND r.status = :status");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(r.title) LIKE LOWER(:search) OR LOWER(r.description) LIKE LOWER(:search))");
        }

        jpql.append(" ORDER BY r.createdAt DESC");

        TypedQuery<Request> query = em.createQuery(jpql.toString(), Request.class);
        query.setParameter("employeeId", employeeId);

        if (status != null && !status.isEmpty()) {
            query.setParameter("status", Request.Status.valueOf(status));
        }
        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        query.setFirstResult(page * size);
        query.setMaxResults(size);

        return query.getResultList();
    }

    public long countByEmployee(String status, String search, Long employeeId) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(r) FROM Request r WHERE r.employee.id = :employeeId");

        if (status != null && !status.isEmpty()) {
            jpql.append(" AND r.status = :status");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(r.title) LIKE LOWER(:search) OR LOWER(r.description) LIKE LOWER(:search))");
        }

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);
        query.setParameter("employeeId", employeeId);

        if (status != null && !status.isEmpty()) {
            query.setParameter("status", Request.Status.valueOf(status));
        }
        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        return query.getSingleResult();
    }
}
