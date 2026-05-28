package com.draxlmaier.hub.repository;

import com.draxlmaier.hub.model.Employee;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;

@Stateless
public class EmployeeRepository {

    @PersistenceContext
    private EntityManager em;

    public Employee save(Employee employee) {
        if (employee.getId() == null) {
            em.persist(employee);
            return employee;
        } else {
            return em.merge(employee);
        }
    }

    public Optional<Employee> findById(Long id) {
        return Optional.ofNullable(em.find(Employee.class, id));
    }

    public List<Employee> findAll() {
        return em.createQuery("SELECT e FROM Employee e", Employee.class).getResultList();
    }

    public List<Employee> findAllPaginated(int page, int size, String role, String search) {
        StringBuilder jpql = new StringBuilder("SELECT e FROM Employee e WHERE 1=1");

        if (role != null && !role.isEmpty()) {
            jpql.append(" AND e.role = :role");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(e.name) LIKE LOWER(:search) OR LOWER(e.email) LIKE LOWER(:search))");
        }

        TypedQuery<Employee> query = em.createQuery(jpql.toString(), Employee.class);

        if (role != null && !role.isEmpty()) {
            query.setParameter("role", role);
        }
        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        query.setFirstResult(page * size);
        query.setMaxResults(size);

        return query.getResultList();
    }

    public long countWithFilters(String role, String search) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(e) FROM Employee e WHERE 1=1");

        if (role != null && !role.isEmpty()) {
            jpql.append(" AND e.role = :role");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(e.name) LIKE LOWER(:search) OR LOWER(e.email) LIKE LOWER(:search))");
        }

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);

        if (role != null && !role.isEmpty()) {
            query.setParameter("role", role);
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

    public Optional<Employee> findByEmail(String email) {
        return em.createQuery("SELECT e FROM Employee e WHERE e.email = :email", Employee.class)
            .setParameter("email", email)
            .getResultList()
            .stream()
            .findFirst();
    }

    public List<Employee> findAllByDepartmentPaginated(int page, int size, String search, Long departmentId) {
        StringBuilder jpql = new StringBuilder("SELECT e FROM Employee e WHERE e.department.id = :departmentId");

        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(e.name) LIKE LOWER(:search) OR LOWER(e.email) LIKE LOWER(:search))");
        }

        TypedQuery<Employee> query = em.createQuery(jpql.toString(), Employee.class);
        query.setParameter("departmentId", departmentId);

        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        query.setFirstResult(page * size);
        query.setMaxResults(size);

        return query.getResultList();
    }

    public long countByDepartment(String search, Long departmentId) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(e) FROM Employee e WHERE e.department.id = :departmentId");

        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(e.name) LIKE LOWER(:search) OR LOWER(e.email) LIKE LOWER(:search))");
        }

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);
        query.setParameter("departmentId", departmentId);

        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        return query.getSingleResult();
    }
}
