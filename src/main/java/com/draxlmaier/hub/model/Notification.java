package com.draxlmaier.hub.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "empl_id", nullable = false)
    private Long userId;

    @Column(nullable = true)
    private String title;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(columnDefinition = "TEXT")
    private String data;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean read = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
