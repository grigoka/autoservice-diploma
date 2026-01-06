package cz.cvut.autoservice.crm.domain.repository;

import cz.cvut.autoservice.crm.domain.model.WorkOrderItem;
import cz.cvut.autoservice.crm.domain.model.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkOrderItemRepository extends JpaRepository<WorkOrderItem, UUID> {

    List<WorkOrderItem> findByWorkOrder(WorkOrder workOrder);
}
