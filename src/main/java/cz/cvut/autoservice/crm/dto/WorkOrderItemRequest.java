package cz.cvut.autoservice.crm.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderItemRequest {
    @NotBlank
    private String title;

    private String details;

    @Min(1)
    @NotNull
    private Integer quantity;

    @NotNull
    @DecimalMin(value = "0.01", message = "Unit price must be greater than zero")
    private BigDecimal unitPrice;
}

