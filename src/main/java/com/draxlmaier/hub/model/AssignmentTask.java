package com.draxlmaier.hub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String itemType;

    @Column(nullable = false)
    private Long itemId;

    @Column(nullable = false)
    private Long acceptedBy;

    @Column(nullable = false)
    private LocalDateTime acceptedAt;

    @Column(nullable = false)
    private String status = "PENDING";

    public AssignmentTask(String itemType, Long itemId, Long acceptedBy) {
        this.itemType = itemType;
        this.itemId = itemId;
        this.acceptedBy = acceptedBy;
    }

    @PrePersist
    protected void onCreate() {
        acceptedAt = LocalDateTime.now();
        status = "PENDING";
    }
}
