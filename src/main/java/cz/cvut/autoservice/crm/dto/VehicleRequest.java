package cz.cvut.autoservice.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VehicleRequest {
    @NotBlank
    private String make;

    @NotBlank
    private String model;

    private Integer yearOfManufacture;
    private String vin;
    private String licensePlate;
    private java.time.Instant nextInspectionAt;
}

