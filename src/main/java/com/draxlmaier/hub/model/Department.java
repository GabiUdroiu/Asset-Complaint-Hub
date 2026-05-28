package com.draxlmaier.hub.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor //(access = AccessLevel.PROTECTED)
@Builder
public class Department {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dept_id")
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_empl_id", nullable = true)
    private Employee responsibleEmployee;
    
    @OneToMany(mappedBy = "department")
    private List<Employee> employees;
}

// @EqualsAndHashCode(exclude = {"responsibleEmployee", "employees"})
// @ToString(exclude = {"responsibleEmployee", "employees"})
