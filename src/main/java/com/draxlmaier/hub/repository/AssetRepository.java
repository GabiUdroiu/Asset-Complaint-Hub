package com.draxlmaier.hub.repository;

import com.draxlmaier.hub.model.Asset;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;

@Stateless
public class AssetRepository {

    @PersistenceContext
    private EntityManager em;

    public Asset save(Asset asset) {
        if (asset.getId() == null) {
            em.persist(asset);
            return asset;
        } else {
            return em.merge(asset);
        }
    }

    public Optional<Asset> findById(Long id) {
        return Optional.ofNullable(em.find(Asset.class, id));
    }

    public List<Asset> findAll() {
        return em.createQuery("SELECT a FROM Asset a", Asset.class).getResultList();
    }

    public List<Asset> findAllPaginated(int page, int size, String status, String category, String search, Long employeeId) {
        StringBuilder jpql = new StringBuilder("SELECT a FROM Asset a LEFT JOIN a.employee e WHERE 1=1");

        if (status != null && !status.isEmpty()) {
            jpql.append(" AND a.status = :status");
        }
        if (category != null && !category.isEmpty()) {
            jpql.append(" AND a.category = :category");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(a.name) LIKE LOWER(:search) OR LOWER(a.serialNumber) LIKE LOWER(:search))");
        }
        if (employeeId != null) {
            jpql.append(" AND e.id = :employeeId");
        }

        TypedQuery<Asset> query = em.createQuery(jpql.toString(), Asset.class);

        if (status != null && !status.isEmpty()) {
            query.setParameter("status", status);
        }
        if (category != null && !category.isEmpty()) {
            query.setParameter("category", category);
        }
        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }
        if (employeeId != null) {
            query.setParameter("employeeId", employeeId);
        }

        query.setFirstResult(page * size);
        query.setMaxResults(size);

        return query.getResultList();
    }

    public long countWithFilters(String status, String category, String search, Long employeeId) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(a) FROM Asset a LEFT JOIN a.employee e WHERE 1=1");

        if (status != null && !status.isEmpty()) {
            jpql.append(" AND a.status = :status");
        }
        if (category != null && !category.isEmpty()) {
            jpql.append(" AND a.category = :category");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(a.name) LIKE LOWER(:search) OR LOWER(a.serialNumber) LIKE LOWER(:search))");
        }
        if (employeeId != null) {
            jpql.append(" AND e.id = :employeeId");
        }

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);

        if (status != null && !status.isEmpty()) {
            query.setParameter("status", status);
        }
        if (category != null && !category.isEmpty()) {
            query.setParameter("category", category);
        }
        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }
        if (employeeId != null) {
            query.setParameter("employeeId", employeeId);
        }

        return query.getSingleResult();
    }

    public void deleteById(Long id) {
        findById(id).ifPresent(em::remove);
    }

    public boolean existsById(Long id) {
        return findById(id).isPresent();
    }

    public List<Asset> findAllByDepartment(int page, int size, String status, String search, Long departmentId) {
        StringBuilder jpql = new StringBuilder("SELECT a FROM Asset a JOIN a.employee e WHERE e.department.id = :departmentId");

        if (status != null && !status.isEmpty()) {
            jpql.append(" AND a.status = :status");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(a.name) LIKE LOWER(:search) OR LOWER(a.serialNumber) LIKE LOWER(:search))");
        }

        TypedQuery<Asset> query = em.createQuery(jpql.toString(), Asset.class);
        query.setParameter("departmentId", departmentId);

        if (status != null && !status.isEmpty()) {
            query.setParameter("status", status);
        }
        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        query.setFirstResult(page * size);
        query.setMaxResults(size);

        return query.getResultList();
    }

    public long countByDepartment(String status, String search, Long departmentId) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(a) FROM Asset a JOIN a.employee e WHERE e.department.id = :departmentId");

        if (status != null && !status.isEmpty()) {
            jpql.append(" AND a.status = :status");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(a.name) LIKE LOWER(:search) OR LOWER(a.serialNumber) LIKE LOWER(:search))");
        }

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);
        query.setParameter("departmentId", departmentId);

        if (status != null && !status.isEmpty()) {
            query.setParameter("status", status);
        }
        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        return query.getSingleResult();
    }
}
