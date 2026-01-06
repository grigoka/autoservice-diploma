package cz.cvut.autoservice.crm.service.interfaces;

import cz.cvut.autoservice.crm.domain.model.WorkOrder;
import cz.cvut.autoservice.crm.domain.model.enums.WorkOrderStatus;

public interface NotificationService {

    void notifyStatusChange(WorkOrder workOrder, WorkOrderStatus oldStatus, WorkOrderStatus newStatus);

    void notifyOrderCompletion(WorkOrder workOrder);

    void notifyInspectionReminder(cz.cvut.autoservice.crm.domain.model.Vehicle vehicle);
}

