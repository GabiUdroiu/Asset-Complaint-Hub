package com.draxlmaier.hub.repository;

import com.draxlmaier.hub.model.Role;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

@Stateless
public class RoleRepository {

    @PersistenceContext
    private EntityManager em;

    public Role findByName(String name) {
        try {
            TypedQuery<Role> query = em.createQuery(
                "SELECT r FROM Role r WHERE r.name = :name",
                Role.class
            );
            query.setParameter("name", name);
            return query.getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }

    public Role save(Role role) {
        em.persist(role);
        return role;
    }

    public Role findById(Long id) {
        return em.find(Role.class, id);
    }
}
