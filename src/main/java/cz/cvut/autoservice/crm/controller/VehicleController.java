package cz.cvut.autoservice.crm.controller;

import cz.cvut.autoservice.crm.dto.VehicleRequest;
import cz.cvut.autoservice.crm.dto.VehicleResponse;
import cz.cvut.autoservice.crm.dto.InspectionDateRequest;
import cz.cvut.autoservice.crm.domain.model.Vehicle;
import cz.cvut.autoservice.crm.security.CurrentUser;
import cz.cvut.autoservice.crm.service.interfaces.VehicleService;
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
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping("/customers/{customerId}/vehicles")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<VehicleResponse> createVehicle(
            @PathVariable UUID customerId,
            @Valid @RequestBody VehicleRequest request) {
        Vehicle vehicle = vehicleService.createVehicleForOwner(
                customerId,
                request.getMake(),
                request.getModel(),
                request.getYearOfManufacture(),
                request.getVin(),
                request.getLicensePlate(),
                request.getNextInspectionAt()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapToVehicleResponse(vehicle));
    }

    @GetMapping("/customers/{customerId}/vehicles")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<VehicleResponse>> getVehiclesByCustomer(@PathVariable UUID customerId) {
        List<Vehicle> vehicles = vehicleService.getByOwner(customerId);
        List<VehicleResponse> responses = vehicles.stream()
                .map(this::mapToVehicleResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/vehicles/{vehicleId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable UUID vehicleId) {
        Vehicle vehicle = vehicleService.getById(vehicleId);
        return ResponseEntity.ok(mapToVehicleResponse(vehicle));
    }

    @GetMapping("/me/vehicles")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<VehicleResponse>> getMyVehicles() {
        UUID userId = CurrentUser.getId();
        List<Vehicle> vehicles = vehicleService.getByOwner(userId);
        List<VehicleResponse> responses = vehicles.stream()
                .map(this::mapToVehicleResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/search/vehicles")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<VehicleResponse>> searchVehicles(@RequestParam String q) {
        List<Vehicle> vehicles = vehicleService.searchVehicles(q);
        List<VehicleResponse> responses = vehicles.stream()
                .map(this::mapToVehicleResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/vehicles/{vehicleId}/inspection-date")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<VehicleResponse> updateInspectionDate(
            @PathVariable UUID vehicleId,
            @Valid @RequestBody InspectionDateRequest request) {
        Vehicle vehicle = vehicleService.updateInspectionDate(vehicleId, request.getNextInspectionAt());
        return ResponseEntity.ok(mapToVehicleResponse(vehicle));
    }

    private VehicleResponse mapToVehicleResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .yearOfManufacture(vehicle.getYearOfManufacture())
                .vin(vehicle.getVin())
                .licensePlate(vehicle.getLicensePlate())
                .ownerId(vehicle.getOwner().getId())
                .nextInspectionAt(vehicle.getNextInspectionAt())
                .lastInspectionReminderAt(vehicle.getLastInspectionReminderAt())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}

