package cz.cvut.autoservice.crm.domain.model;

import cz.cvut.autoservice.crm.domain.model.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "vehicles",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_vehicles_vin", columnNames = "vin"),
                @UniqueConstraint(name = "uk_vehicles_license_plate", columnNames = "license_plate")
        },
        indexes = {
                @Index(name = "ix_vehicles_owner_id", columnList = "owner_id")
        })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Vehicle extends AuditableEntity {

    @NotBlank
    @Column(nullable = false)
    private String make;

    @NotBlank
    @Column(nullable = false)
    private String model;

    @Column(name = "year_of_manufacture")
    private Integer yearOfManufacture;

    @Column(length = 32)
    private String vin;

    @Column(name = "license_plate", length = 16)
    private String licensePlate;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_vehicle_owner"))
    private User owner;

    @Column(name = "next_inspection_at")
    private java.time.Instant nextInspectionAt;

    @Column(name = "last_inspection_reminder_at")
    private java.time.Instant lastInspectionReminderAt;
}
