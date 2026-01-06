package cz.cvut.autoservice.crm.service.interfaces;

import cz.cvut.autoservice.crm.domain.model.WorkOrder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface WorkOrderService {

    WorkOrder createDraftOrder(UUID customerId, UUID vehicleId);

    WorkOrder addItem(UUID workOrderId, String title, String details,
                      int quantity, BigDecimal unitPrice);

    WorkOrder updateItem(UUID itemId, String title, String details,
                         int quantity, BigDecimal unitPrice);

    void removeItem(UUID itemId);

    WorkOrder markWaitingForApproval(UUID workOrderId);

    WorkOrder markInProgress(UUID workOrderId);

    WorkOrder markDone(UUID workOrderId);

    WorkOrder cancel(UUID workOrderId);

    WorkOrder getById(UUID workOrderId);

    List<WorkOrder> getByCustomer(UUID customerId);

    List<WorkOrder> getByVehicle(UUID vehicleId);

    WorkOrder assignMechanic(UUID workOrderId, UUID mechanicId);

    List<WorkOrder> getForMechanic(UUID mechanicId);

    WorkOrder mechanicStartWork(UUID workOrderId, UUID mechanicId);

    WorkOrder mechanicMarkReady(UUID workOrderId, UUID mechanicId);

    List<WorkOrder> getAllWorkOrders(cz.cvut.autoservice.crm.domain.model.enums.WorkOrderStatus status,
                                     UUID customerId, UUID vehicleId, UUID mechanicId);

    List<WorkOrder> searchWorkOrders(String query);
}

