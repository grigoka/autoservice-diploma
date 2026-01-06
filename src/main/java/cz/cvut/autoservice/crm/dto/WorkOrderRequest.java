package cz.cvut.autoservice.crm.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class WorkOrderRequest {
    @NotNull
    private UUID customerId;

    @NotNull
    private UUID vehicleId;
}

