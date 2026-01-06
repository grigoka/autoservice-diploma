package cz.cvut.autoservice.crm.domain.model;

import cz.cvut.autoservice.crm.domain.model.enums.WorkOrderStatus;
import cz.cvut.autoservice.crm.domain.model.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_orders",
        indexes = {
                @Index(name = "ix_work_orders_customer_id", columnList = "customer_id"),
                @Index(name = "ix_work_orders_vehicle_id", columnList = "vehicle_id"),
                @Index(name = "ix_work_orders_status", columnList = "status"),
                @Index(name = "ix_work_orders_assigned_mechanic_id", columnList = "assigned_mechanic_id")
        })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WorkOrder extends AuditableEntity {

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_workorder_customer"))
    private User customer;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_workorder_vehicle"))
    private Vehicle vehicle;

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_mechanic_id", nullable = true,
            foreignKey = @ForeignKey(name = "fk_workorder_mechanic"))
    private User assignedMechanic;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private WorkOrderStatus status;

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkOrderItem> items = new ArrayList<>();

    @Column(name = "vat_rate", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal vatRate = new BigDecimal("0.21");

    public void addItem(WorkOrderItem item) {
        item.setWorkOrder(this);
        this.items.add(item);
    }

    public void removeItem(WorkOrderItem item) {
        this.items.remove(item);
        item.setWorkOrder(null);
    }

    @Transient
    public BigDecimal getSubtotal() {
        return items.stream()
                .map(WorkOrderItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transient
    public BigDecimal getVatAmount() {
        return getSubtotal().multiply(vatRate).setScale(2, RoundingMode.HALF_UP);
    }

    @Transient
    public BigDecimal getTotal() {
        return getSubtotal().add(getVatAmount()).setScale(2, RoundingMode.HALF_UP);
    }
    public void markWaitingForApproval() {
        if (status != WorkOrderStatus.DRAFT) {
            throw new IllegalStateException("Can transition to WAITING_FOR_APPROVAL only from DRAFT");
        }
        if (items.isEmpty()) {
            throw new IllegalStateException("Cannot move order to waiting for approval without items");
        }
        this.status = WorkOrderStatus.WAITING_FOR_APPROVAL;
    }

    public void markInProgress() {
        if (status != WorkOrderStatus.WAITING_FOR_APPROVAL) {
            throw new IllegalStateException("Can transition to IN_PROGRESS only from WAITING_FOR_APPROVAL");
        }
        this.status = WorkOrderStatus.IN_PROGRESS;
    }

    public void markReady() {
        if (status != WorkOrderStatus.IN_PROGRESS) {
            throw new IllegalStateException("Can transition to READY only from IN_PROGRESS");
        }
        this.status = WorkOrderStatus.READY;
    }

    public void markDone() {
        if (status != WorkOrderStatus.READY) {
            throw new IllegalStateException("Can complete order only from READY");
        }
        if (items.isEmpty()) {
            throw new IllegalStateException("Cannot complete order without items");
        }
        if (status == WorkOrderStatus.CANCELED) {
            throw new IllegalStateException("Cannot complete a canceled order");
        }
        this.status = WorkOrderStatus.DONE;
    }

    public void cancel() {
        if (status == WorkOrderStatus.DONE) {
            throw new IllegalStateException("Cannot cancel a completed order");
        }
        this.status = WorkOrderStatus.CANCELED;
    }
}
