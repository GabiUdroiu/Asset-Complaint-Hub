package com.draxlmaier.hub.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String description;

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Employee> employees;

    public enum RoleType {
        USER, DEPT_RESPONSIBLE, ADMIN
    }
}
