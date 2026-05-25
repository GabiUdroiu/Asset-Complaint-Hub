package com.draxlmaier.hub.repository;

import com.draxlmaier.hub.model.Department;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;

@Stateless
public class DepartmentRepository {

    @PersistenceContext
    private EntityManager em;

    public Department save(Department department) {
        if (department.getId() == null) {
            em.persist(department);
            return department;
        } else {
            return em.merge(department);
        }
    }

    public Optional<Department> findById(Long id) {
        return Optional.ofNullable(em.find(Department.class, id));
    }

    public List<Department> findAll() {
        return em.createQuery("SELECT d FROM Department d", Department.class).getResultList();
    }

    public List<Department> findAllPaginated(int page, int size, String search) {
        StringBuilder jpql = new StringBuilder("SELECT d FROM Department d WHERE 1=1");

        if (search != null && !search.isEmpty()) {
            jpql.append(" AND LOWER(d.name) LIKE LOWER(:search)");
        }

        TypedQuery<Department> query = em.createQuery(jpql.toString(), Department.class);

        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        query.setFirstResult(page * size);
        query.setMaxResults(size);

        return query.getResultList();
    }

    public long countWithFilters(String search) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(d) FROM Department d WHERE 1=1");

        if (search != null && !search.isEmpty()) {
            jpql.append(" AND LOWER(d.name) LIKE LOWER(:search)");
        }

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);

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

    public Optional<Department> findByName(String name) {
        return em.createQuery("SELECT d FROM Department d WHERE d.name = :name", Department.class)
            .setParameter("name", name)
            .getResultList()
            .stream()
            .findFirst();
    }
}
