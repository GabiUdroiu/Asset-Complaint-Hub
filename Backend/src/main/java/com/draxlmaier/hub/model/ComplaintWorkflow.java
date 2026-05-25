package com.draxlmaier.hub.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_workflows")
@Data
@NoArgsConstructor
@AllArgsConstructor //(access = AccessLevel.PROTECTED)
@Builder
public class ComplaintWorkflow {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empl_id", nullable = false)
    private Employee employee;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", nullable = true)
    private Complaint.Status oldStatus;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false)
    private Complaint.Status currentStatus;
    
    @Column(nullable = false)
    private LocalDateTime changedAt;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @PrePersist
    protected void onCreate() {
        if (changedAt == null) {
            changedAt = LocalDateTime.now();
        }
    }
}

// @EqualsAndHashCode(exclude = {"changedAt", "complaint", "employee"})
// @ToString(exclude = {"reason", "complaint", "employee"})