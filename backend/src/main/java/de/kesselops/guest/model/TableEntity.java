package de.kesselops.guest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Table entity - physical table in a venue.
 */
@Entity
@Table(name = "tables", schema = "guest")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(name = "table_number", nullable = false, length = 20)
    private String tableNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @PrePersist
    protected void onCreate() {
        if (isActive == null) {
            isActive = true;
        }
    }
}
