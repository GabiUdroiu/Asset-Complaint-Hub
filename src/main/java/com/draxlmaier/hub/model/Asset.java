package com.draxlmaier.hub.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asset_id")
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String serialNumber;

    @Column
    private String category;

    @Column
    private String status;

    @Column
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastUpdated;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "empl_id", nullable = true)
    private Employee employee;

    @Version
    private Long version;

    @OneToMany(mappedBy = "asset")
    private List<Complaint> complaints;

    @PrePersist
    protected void onCreate() {
        if (lastUpdated == null) {
            lastUpdated = LocalDateTime.now();
        }
        if (version == null) {
            version = 0L;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}