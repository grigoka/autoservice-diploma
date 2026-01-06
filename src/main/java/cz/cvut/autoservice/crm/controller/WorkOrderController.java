package cz.cvut.autoservice.crm.controller;

import cz.cvut.autoservice.crm.domain.model.enums.WorkOrderStatus;
import cz.cvut.autoservice.crm.dto.AssignMechanicRequest;
import cz.cvut.autoservice.crm.dto.WorkOrderItemRequest;
import cz.cvut.autoservice.crm.dto.WorkOrderItemResponse;
import cz.cvut.autoservice.crm.dto.WorkOrderRequest;
import cz.cvut.autoservice.crm.dto.WorkOrderResponse;
import cz.cvut.autoservice.crm.domain.model.WorkOrder;
import cz.cvut.autoservice.crm.domain.model.WorkOrderItem;
import cz.cvut.autoservice.crm.security.CurrentUser;
import cz.cvut.autoservice.crm.service.interfaces.WorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @PostMapping("/work-orders")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<WorkOrderResponse> createWorkOrder(@Valid @RequestBody WorkOrderRequest request) {
        WorkOrder order = workOrderService.createDraftOrder(request.getCustomerId(), request.getVehicleId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapToWorkOrderResponse(order));
    }

    @PostMapping("/work-orders/{orderId}/items")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<WorkOrderResponse> addItem(
            @PathVariable UUID orderId,
            @Valid @RequestBody WorkOrderItemRequest request) {
        WorkOrder order = workOrderService.addItem(
                orderId,
                request.getTitle(),
                request.getDetails(),
                request.getQuantity(),
                request.getUnitPrice()
        );
        return ResponseEntity.ok(mapToWorkOrderResponse(order));
    }

    @PutMapping("/work-orders/items/{itemId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<WorkOrderResponse> updateItem(
            @PathVariable UUID itemId,
            @Valid @RequestBody WorkOrderItemRequest request) {
        WorkOrder order = workOrderService.updateItem(
                itemId,
                request.getTitle(),
                request.getDetails(),
                request.getQuantity(),
                request.getUnitPrice()
        );
        return ResponseEntity.ok(mapToWorkOrderResponse(order));
    }

    @DeleteMapping("/work-orders/items/{itemId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteItem(@PathVariable UUID itemId) {
        workOrderService.removeItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/work-orders/{orderId}/status/waiting-for-approval")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<WorkOrderResponse> markWaitingForApproval(@PathVariable UUID orderId) {
        WorkOrder order = workOrderService.markWaitingForApproval(orderId);
        return ResponseEntity.ok(mapToWorkOrderResponse(order));
    }

    @PostMapping("/work-orders/{orderId}/status/in-progress")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<WorkOrderResponse> markInProgress(@PathVariable UUID orderId) {
        WorkOrder order = workOrderService.markInProgress(orderId);
        return ResponseEntity.ok(mapToWorkOrderResponse(order));
    }

    @PostMapping("/work-orders/{orderId}/assign-mechanic")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<WorkOrderResponse> assignMechanic(
            @PathVariable UUID orderId,
            @Valid @RequestBody AssignMechanicRequest request) {
        WorkOrder order = workOrderService.assignMechanic(orderId, request.getMechanicId());
        return ResponseEntity.ok(mapToWorkOrderResponse(order));
    }

    @PostMapping("/work-orders/{orderId}/status/done")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<WorkOrderResponse> markDone(@PathVariable UUID orderId) {
        WorkOrder order = workOrderService.markDone(orderId);
        return ResponseEntity.ok(mapToWorkOrderResponse(order));
    }

    @PostMapping("/work-orders/{orderId}/status/cancel")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<WorkOrderResponse> cancel(@PathVariable UUID orderId) {
        WorkOrder order = workOrderService.cancel(orderId);
        return ResponseEntity.ok(mapToWorkOrderResponse(order));
    }

    @GetMapping("/work-orders")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<WorkOrderResponse>> getAllWorkOrders(
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) UUID vehicleId,
            @RequestParam(required = false) UUID mechanicId) {
        List<WorkOrder> orders = workOrderService.getAllWorkOrders(status, customerId, vehicleId, mechanicId);
        List<WorkOrderResponse> responses = orders.stream()
                .map(this::mapToWorkOrderResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/work-orders/{orderId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<WorkOrderResponse> getWorkOrderById(@PathVariable UUID orderId) {
        WorkOrder order = workOrderService.getById(orderId);
        return ResponseEntity.ok(mapToWorkOrderResponse(order));
    }

    @GetMapping("/search/work-orders")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<WorkOrderResponse>> searchWorkOrders(@RequestParam String q) {
        List<WorkOrder> orders = workOrderService.searchWorkOrders(q);
        List<WorkOrderResponse> responses = orders.stream()
                .map(this::mapToWorkOrderResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/customers/{customerId}/work-orders")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<WorkOrderResponse>> getWorkOrdersByCustomer(@PathVariable UUID customerId) {
        List<WorkOrder> orders = workOrderService.getByCustomer(customerId);
        List<WorkOrderResponse> responses = orders.stream()
                .map(this::mapToWorkOrderResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/vehicles/{vehicleId}/work-orders")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<WorkOrderResponse>> getWorkOrdersByVehicle(@PathVariable UUID vehicleId) {
        List<WorkOrder> orders = workOrderService.getByVehicle(vehicleId);
        List<WorkOrderResponse> responses = orders.stream()
                .map(this::mapToWorkOrderResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/me/work-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<WorkOrderResponse>> getMyWorkOrders() {
        UUID userId = CurrentUser.getId();
        List<WorkOrder> orders = workOrderService.getByCustomer(userId);
        List<WorkOrderResponse> responses = orders.stream()
                .map(this::mapToWorkOrderResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/me/work-orders/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<WorkOrderResponse> getMyWorkOrderById(@PathVariable UUID orderId) {
        UUID userId = CurrentUser.getId();
        WorkOrder order = workOrderService.getById(orderId);
        if (!order.getCustomer().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(mapToWorkOrderResponse(order));
    }

    @GetMapping("/me/assigned-work-orders")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<List<WorkOrderResponse>> getMyAssignedWorkOrders() {
        UUID mechanicId = CurrentUser.getId();
        List<WorkOrder> orders = workOrderService.getForMechanic(mechanicId);
        List<WorkOrderResponse> responses = orders.stream()
                .map(this::mapToWorkOrderResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/me/assigned-work-orders/{orderId}")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<WorkOrderResponse> getMyAssignedWorkOrderById(@PathVariable UUID orderId) {
        UUID mechanicId = CurrentUser.getId();
        WorkOrder order = workOrderService.getById(orderId);
        if (order.getAssignedMechanic() == null || !order.getAssignedMechanic().getId().equals(mechanicId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(mapToWorkOrderResponse(order));
    }

    @PostMapping("/me/assigned-work-orders/{orderId}/status/in-progress")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<WorkOrderResponse> mechanicStartWork(@PathVariable UUID orderId) {
        UUID mechanicId = CurrentUser.getId();
        WorkOrder order = workOrderService.mechanicStartWork(orderId, mechanicId);
        return ResponseEntity.ok(mapToWorkOrderResponse(order));
    }

    @PostMapping("/me/assigned-work-orders/{orderId}/status/ready")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<WorkOrderResponse> mechanicMarkReady(@PathVariable UUID orderId) {
        UUID mechanicId = CurrentUser.getId();
        WorkOrder order = workOrderService.mechanicMarkReady(orderId, mechanicId);
        return ResponseEntity.ok(mapToWorkOrderResponse(order));
    }

    private WorkOrderResponse mapToWorkOrderResponse(WorkOrder order) {
        List<WorkOrderItemResponse> items = order.getItems().stream()
                .map(this::mapToWorkOrderItemResponse)
                .collect(Collectors.toList());

        WorkOrderResponse.WorkOrderResponseBuilder builder = WorkOrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .vehicleId(order.getVehicle().getId())
                .status(order.getStatus())
                .vatRate(order.getVatRate())
                .subtotal(order.getSubtotal())
                .vatAmount(order.getVatAmount())
                .total(order.getTotal())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt());

        if (order.getAssignedMechanic() != null) {
            builder.assignedMechanicId(order.getAssignedMechanic().getId())
                   .assignedMechanicName(order.getAssignedMechanic().getFullName());
        }

        return builder.build();
    }

    private WorkOrderItemResponse mapToWorkOrderItemResponse(WorkOrderItem item) {
        return WorkOrderItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .details(item.getDetails())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getLineTotal())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

}

