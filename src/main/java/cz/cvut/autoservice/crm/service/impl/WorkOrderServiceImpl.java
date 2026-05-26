package cz.cvut.autoservice.crm.service.impl;

import cz.cvut.autoservice.crm.domain.model.User;
import cz.cvut.autoservice.crm.domain.model.Vehicle;
import cz.cvut.autoservice.crm.domain.model.WorkOrder;
import cz.cvut.autoservice.crm.domain.model.WorkOrderItem;
import cz.cvut.autoservice.crm.domain.model.enums.UserRole;
import cz.cvut.autoservice.crm.domain.model.enums.WorkOrderStatus;
import cz.cvut.autoservice.crm.domain.repository.VehicleRepository;
import cz.cvut.autoservice.crm.domain.repository.WorkOrderItemRepository;
import cz.cvut.autoservice.crm.domain.repository.WorkOrderRepository;
import cz.cvut.autoservice.crm.service.interfaces.AppSettingsService;
import cz.cvut.autoservice.crm.service.interfaces.NotificationService;
import cz.cvut.autoservice.crm.service.interfaces.UserService;
import cz.cvut.autoservice.crm.service.interfaces.WorkOrderService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WorkOrderServiceImpl implements WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderItemRepository workOrderItemRepository;
    private final UserService userService;
    private final VehicleRepository vehicleRepository;
    private final NotificationService notificationService;
    private final AppSettingsService appSettingsService;
    @Value("${app.vat.default-rate:0.21}")
    private java.math.BigDecimal defaultVatRate;

    @Override
    public WorkOrder createDraftOrder(UUID customerId, UUID vehicleId) {
        log.debug("Creating draft order for customer {} and vehicle {}", customerId, vehicleId);

        User customer = userService.getCustomerById(customerId);

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + vehicleId));

        if (!vehicle.getOwner().getId().equals(customerId)) {
            throw new IllegalArgumentException("Vehicle with id " + vehicleId + " does not belong to customer " + customerId);
        }

        var settings = appSettingsService.getEffectiveSettings(null, null, null, null, null, true, defaultVatRate);
        java.math.BigDecimal vatRate = settings.getVatRate() != null ? settings.getVatRate() : defaultVatRate;

        WorkOrder order = WorkOrder.builder()
                .customer(customer)
                .vehicle(vehicle)
                .status(WorkOrderStatus.DRAFT)
                .vatRate(vatRate)
                .build();

        return workOrderRepository.save(order);
    }

    @Override
    public WorkOrder addItem(UUID workOrderId, String title, String details,
                             int quantity, BigDecimal unitPrice) {
        log.debug("Adding item to work order {}", workOrderId);

        WorkOrder order = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new EntityNotFoundException("Work order not found with id: " + workOrderId));

        if (order.getStatus() == WorkOrderStatus.DONE || order.getStatus() == WorkOrderStatus.CANCELED) {
            throw new IllegalStateException("Cannot add items to orders with status DONE or CANCELED");
        }

        WorkOrderItem item = WorkOrderItem.builder()
                .title(title)
                .details(details)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .build();

        order.addItem(item);
        return workOrderRepository.save(order);
    }

    @Override
    public WorkOrder updateItem(UUID itemId, String title, String details,
                                 int quantity, BigDecimal unitPrice) {
        log.debug("Updating work order item {}", itemId);

        WorkOrderItem item = workOrderItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Work order item not found with id: " + itemId));

        WorkOrder order = item.getWorkOrder();
        if (order.getStatus() == WorkOrderStatus.DONE || order.getStatus() == WorkOrderStatus.CANCELED) {
            throw new IllegalStateException("Cannot update items in orders with status DONE or CANCELED");
        }

        item.setTitle(title);
        item.setDetails(details);
        item.setQuantity(quantity);
        item.setUnitPrice(unitPrice);

        workOrderItemRepository.save(item);
        return order;
    }

    @Override
    public void removeItem(UUID itemId) {
        log.debug("Removing work order item {}", itemId);

        WorkOrderItem item = workOrderItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Work order item not found with id: " + itemId));

        WorkOrder order = item.getWorkOrder();
        if (order.getStatus() == WorkOrderStatus.DONE || order.getStatus() == WorkOrderStatus.CANCELED) {
            throw new IllegalStateException("Cannot remove items from orders with status DONE or CANCELED");
        }

        order.removeItem(item);
        workOrderRepository.save(order);
    }

    @Override
    public WorkOrder markWaitingForApproval(UUID workOrderId) {
        log.debug("Marking work order {} as waiting for approval", workOrderId);

        WorkOrder order = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new EntityNotFoundException("Work order not found with id: " + workOrderId));

        WorkOrderStatus oldStatus = order.getStatus();
        order.markWaitingForApproval();
        WorkOrder savedOrder = workOrderRepository.save(order);
        notificationService.notifyStatusChange(savedOrder, oldStatus, savedOrder.getStatus());
        return savedOrder;
    }

    @Override
    public WorkOrder markInProgress(UUID workOrderId) {
        log.debug("Marking work order {} as in progress", workOrderId);

        WorkOrder order = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new EntityNotFoundException("Work order not found with id: " + workOrderId));

        WorkOrderStatus oldStatus = order.getStatus();
        order.markInProgress();
        WorkOrder savedOrder = workOrderRepository.save(order);
        notificationService.notifyStatusChange(savedOrder, oldStatus, savedOrder.getStatus());
        return savedOrder;
    }

    @Override
    public WorkOrder markDone(UUID workOrderId) {
        log.debug("Marking work order {} as done", workOrderId);

        WorkOrder order = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new EntityNotFoundException("Work order not found with id: " + workOrderId));

        WorkOrderStatus oldStatus = order.getStatus();
        order.markDone();
        WorkOrder savedOrder = workOrderRepository.save(order);
        
        notificationService.notifyOrderCompletion(savedOrder);
        notificationService.notifyStatusChange(savedOrder, oldStatus, savedOrder.getStatus());
        
        return savedOrder;
    }

    @Override
    public WorkOrder cancel(UUID workOrderId) {
        log.debug("Canceling work order {}", workOrderId);

        WorkOrder order = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new EntityNotFoundException("Work order not found with id: " + workOrderId));

        WorkOrderStatus oldStatus = order.getStatus();
        order.cancel();
        WorkOrder savedOrder = workOrderRepository.save(order);
        notificationService.notifyStatusChange(savedOrder, oldStatus, savedOrder.getStatus());

        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public WorkOrder getById(UUID workOrderId) {
        log.debug("Getting work order by id {}", workOrderId);

        return workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new EntityNotFoundException("Work order not found with id: " + workOrderId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrder> getByCustomer(UUID customerId) {
        log.debug("Getting work orders for customer {}", customerId);

        return workOrderRepository.findByCustomerId(customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrder> getByVehicle(UUID vehicleId) {
        log.debug("Getting work orders for vehicle {}", vehicleId);

        return workOrderRepository.findByVehicleId(vehicleId);
    }

    @Override
    public WorkOrder assignMechanic(UUID workOrderId, UUID mechanicId) {
        log.debug("Assigning mechanic {} to work order {}", mechanicId, workOrderId);

        WorkOrder order = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new EntityNotFoundException("Work order not found with id: " + workOrderId));

        User mechanic = userService.getById(mechanicId);
        if (mechanic.getRole() != UserRole.MECHANIC) {
            throw new IllegalArgumentException("User with id " + mechanicId + " is not a MECHANIC");
        }

        order.setAssignedMechanic(mechanic);
        return workOrderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrder> getForMechanic(UUID mechanicId) {
        log.debug("Getting work orders for mechanic {}", mechanicId);

        return workOrderRepository.findByAssignedMechanicId(mechanicId);
    }

    @Override
    public WorkOrder mechanicStartWork(UUID workOrderId, UUID mechanicId) {
        log.debug("Mechanic {} starting work on order {}", mechanicId, workOrderId);

        WorkOrder order = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new EntityNotFoundException("Work order not found with id: " + workOrderId));

        if (order.getAssignedMechanic() == null || !order.getAssignedMechanic().getId().equals(mechanicId)) {
            throw new IllegalArgumentException("Work order is not assigned to mechanic " + mechanicId);
        }

        if (order.getStatus() == WorkOrderStatus.WAITING_FOR_APPROVAL) {
            WorkOrderStatus oldStatus = order.getStatus();
            order.markInProgress();
            WorkOrder savedOrder = workOrderRepository.save(order);
            notificationService.notifyStatusChange(savedOrder, oldStatus, savedOrder.getStatus());
            return savedOrder;
        }
        if (order.getStatus() == WorkOrderStatus.IN_PROGRESS) {
            return order;
        }
        throw new IllegalStateException("Can start work only from WAITING_FOR_APPROVAL or IN_PROGRESS");
    }

    @Override
    public WorkOrder mechanicMarkReady(UUID workOrderId, UUID mechanicId) {
        log.debug("Mechanic {} marking order {} as ready", mechanicId, workOrderId);

        WorkOrder order = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new EntityNotFoundException("Work order not found with id: " + workOrderId));

        if (order.getAssignedMechanic() == null || !order.getAssignedMechanic().getId().equals(mechanicId)) {
            throw new IllegalArgumentException("Work order is not assigned to mechanic " + mechanicId);
        }

        if (order.getStatus() != WorkOrderStatus.IN_PROGRESS) {
            throw new IllegalStateException("Can only mark as ready from IN_PROGRESS status");
        }

        WorkOrderStatus oldStatus = order.getStatus();
        order.markReady();
        WorkOrder savedOrder = workOrderRepository.save(order);
        notificationService.notifyOrderCompletion(savedOrder);
        notificationService.notifyStatusChange(savedOrder, oldStatus, savedOrder.getStatus());

        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrder> getAllWorkOrders(cz.cvut.autoservice.crm.domain.model.enums.WorkOrderStatus status,
                                            UUID customerId, UUID vehicleId, UUID mechanicId) {
        log.debug("Getting all work orders with filters: status={}, customerId={}, vehicleId={}, mechanicId={}",
                status, customerId, vehicleId, mechanicId);

        return workOrderRepository.findAllWithFilters(status, customerId, vehicleId, mechanicId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrder> searchWorkOrders(String query) {
        log.debug("Searching work orders with query: {}", query);

        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        String searchPattern = "%" + query.trim() + "%";
        return workOrderRepository.searchWorkOrders(searchPattern);
    }
}

