package cz.cvut.autoservice.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private UUID id;
    private String make;
    private String model;
    private Integer yearOfManufacture;
    private String vin;
    private String licensePlate;
    private UUID ownerId;
    private java.time.Instant nextInspectionAt;
    private java.time.Instant lastInspectionReminderAt;
    private Instant createdAt;
    private Instant updatedAt;
}

