package cz.cvut.autoservice.crm.domain;

import cz.cvut.autoservice.crm.domain.model.WorkOrder;
import cz.cvut.autoservice.crm.domain.model.WorkOrderItem;
import cz.cvut.autoservice.crm.domain.model.enums.WorkOrderStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class WorkOrderDomainTest {

    @Test
    void markWaitingForApproval_succeeds_whenDraftAndHasItems() {
        WorkOrder order = newDraftOrder();
        order.addItem(item("Diagnostics", 1, "500"));

        order.markWaitingForApproval();

        assertThat(order.getStatus()).isEqualTo(WorkOrderStatus.WAITING_FOR_APPROVAL);
    }

    @Test
    void markWaitingForApproval_fails_whenNoItems() {
        WorkOrder order = newDraftOrder();

        assertThatThrownBy(order::markWaitingForApproval)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("without items");
    }

    @Test
    void markInProgress_onlyFromWaitingForApproval() {
        WorkOrder order = newDraftOrder();
        order.addItem(item("Diagnostics", 1, "500"));
        order.markWaitingForApproval();

        order.markInProgress();

        assertThat(order.getStatus()).isEqualTo(WorkOrderStatus.IN_PROGRESS);

        WorkOrder wrong = newDraftOrder();
        assertThatThrownBy(wrong::markInProgress)
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void markReady_onlyFromInProgress() {
        WorkOrder order = newDraftOrderWithItems();
        order.markWaitingForApproval();
        order.markInProgress();

        order.markReady();

        assertThat(order.getStatus()).isEqualTo(WorkOrderStatus.READY);

        WorkOrder wrong = newDraftOrderWithItems();
        assertThatThrownBy(wrong::markReady)
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void markDone_onlyFromReady_andWithItems_notCanceled() {
        WorkOrder order = newDraftOrderWithItems();
        order.markWaitingForApproval();
        order.markInProgress();
        order.markReady();

        order.markDone();

        assertThat(order.getStatus()).isEqualTo(WorkOrderStatus.DONE);

        WorkOrder noItems = newDraftOrder();
        noItems.markWaitingForApproval();
        noItems.markInProgress();
        noItems.markReady();
        noItems.getItems().clear();
        assertThatThrownBy(noItems::markDone).isInstanceOf(IllegalStateException.class);

        WorkOrder canceled = newDraftOrderWithItems();
        canceled.markWaitingForApproval();
        canceled.markInProgress();
        canceled.cancel();
        assertThatThrownBy(canceled::markDone).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void cancel_forbiddenWhenDone() {
        WorkOrder order = newDraftOrderWithItems();
        order.markWaitingForApproval();
        order.markInProgress();
        order.markReady();
        order.markDone();

        assertThatThrownBy(order::cancel).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void calculatesSubtotalVatAndTotal() {
        WorkOrder order = newDraftOrder();
        order.addItem(item("Labor", 2, "1000"));
        order.addItem(item("Part", 3, "250.50"));

        BigDecimal subtotal = order.getSubtotal();
        BigDecimal vat = order.getVatAmount();
        BigDecimal total = order.getTotal();

        assertThat(subtotal).isEqualByComparingTo(new BigDecimal("2751.50"));
        assertThat(vat).isEqualByComparingTo(new BigDecimal("577.82"));
        assertThat(total).isEqualByComparingTo(new BigDecimal("3329.32"));
    }

    private WorkOrder newDraftOrder() {
        return WorkOrder.builder()
                .status(WorkOrderStatus.DRAFT)
                .vatRate(new BigDecimal("0.21"))
                .build();
    }

    private WorkOrder newDraftOrderWithItems() {
        WorkOrder order = newDraftOrder();
        order.addItem(item("Diagnostics", 1, "500"));
        return order;
    }

    private WorkOrderItem item(String title, int qty, String price) {
        return WorkOrderItem.builder()
                .title(title)
                .quantity(qty)
                .unitPrice(new BigDecimal(price))
                .build();
    }
}

