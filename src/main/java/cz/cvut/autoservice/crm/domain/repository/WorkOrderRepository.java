package cz.cvut.autoservice.crm.domain.repository;

import cz.cvut.autoservice.crm.domain.model.WorkOrder;
import cz.cvut.autoservice.crm.domain.model.User;
import cz.cvut.autoservice.crm.domain.model.Vehicle;
import cz.cvut.autoservice.crm.domain.model.enums.WorkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, UUID> {

    List<WorkOrder> findByCustomer(User customer);

    List<WorkOrder> findByVehicle(Vehicle vehicle);

    List<WorkOrder> findByStatus(WorkOrderStatus status);

    List<WorkOrder> findByCustomerId(UUID customerId);

    List<WorkOrder> findByVehicleId(UUID vehicleId);

    List<WorkOrder> findByAssignedMechanicId(UUID mechanicId);

    @Query("SELECT wo FROM WorkOrder wo WHERE " +
           "(:status IS NULL OR wo.status = :status) AND " +
           "(:customerId IS NULL OR wo.customer.id = :customerId) AND " +
           "(:vehicleId IS NULL OR wo.vehicle.id = :vehicleId) AND " +
           "(:mechanicId IS NULL OR wo.assignedMechanic.id = :mechanicId)")
    List<WorkOrder> findAllWithFilters(
            @Param("status") WorkOrderStatus status,
            @Param("customerId") UUID customerId,
            @Param("vehicleId") UUID vehicleId,
            @Param("mechanicId") UUID mechanicId
    );

    @Query("SELECT wo FROM WorkOrder wo WHERE " +
           "LOWER(CAST(wo.id AS string)) LIKE LOWER(:query) OR " +
           "LOWER(wo.customer.firstName) LIKE LOWER(:query) OR " +
           "LOWER(wo.customer.lastName) LIKE LOWER(:query) OR " +
           "LOWER(wo.customer.email) LIKE LOWER(:query) OR " +
           "LOWER(wo.vehicle.make) LIKE LOWER(:query) OR " +
           "LOWER(wo.vehicle.model) LIKE LOWER(:query) OR " +
           "LOWER(wo.vehicle.licensePlate) LIKE LOWER(:query) OR " +
           "LOWER(wo.vehicle.vin) LIKE LOWER(:query)")
    List<WorkOrder> searchWorkOrders(@Param("query") String query);
}
