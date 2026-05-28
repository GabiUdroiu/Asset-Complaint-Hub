package com.draxlmaier.hub.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor //(access = AccessLevel.PROTECTED)
@Builder
public class Complaint {
    
    public enum Status {
        NEW, IN_REVIEW, IN_PROGRESS, RESOLVED, REJECTED, CLOSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = true)
    private Asset asset;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "empl_id", nullable = false)
    private Employee employee;
    
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComplaintComment> comments;
    
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComplaintWorkflow> workflows;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locked_by_empl_id", nullable = true)
    private Employee lockedBy;

    @Column(nullable = true)
    private LocalDateTime lockedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = Status.NEW;
        }
        if (version == null) {
            version = 0L;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

// @EqualsAndHashCode(exclude = {"createdAt", "updatedAt", "comments", "workflows", "asset", "employee"})
// @ToString(exclude = {"description", "comments", "workflows", "asset", "employee"})