package cz.cvut.autoservice.crm.domain.model;

import cz.cvut.autoservice.crm.domain.model.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "work_order_items",
        indexes = {
                @Index(name = "ix_items_work_order_id", columnList = "work_order_id")
        })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WorkOrderItem extends AuditableEntity {

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_item_workorder"))
    private WorkOrder workOrder;

    @NotBlank
    @Column(nullable = false)
    private String title;

    private String details;

    @Min(1)
    @Column(nullable = false)
    private Integer quantity;

    @NotNull
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Transient
    public BigDecimal getLineTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity.longValue()))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
