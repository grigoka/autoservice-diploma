package cz.cvut.autoservice.crm.dto;

import cz.cvut.autoservice.crm.domain.model.enums.WorkOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderResponse {
    private UUID id;
    private UUID customerId;
    private UUID vehicleId;
    private UUID assignedMechanicId;
    private String assignedMechanicName;
    private WorkOrderStatus status;
    private BigDecimal vatRate;
    private BigDecimal subtotal;
    private BigDecimal vatAmount;
    private BigDecimal total;
    private List<WorkOrderItemResponse> items;
    private Instant createdAt;
    private Instant updatedAt;
}

