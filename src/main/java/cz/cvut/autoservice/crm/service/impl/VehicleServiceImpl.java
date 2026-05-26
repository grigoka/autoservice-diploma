package cz.cvut.autoservice.crm.service.impl;

import cz.cvut.autoservice.crm.domain.model.User;
import cz.cvut.autoservice.crm.domain.model.Vehicle;
import cz.cvut.autoservice.crm.domain.repository.VehicleRepository;
import cz.cvut.autoservice.crm.service.interfaces.UserService;
import cz.cvut.autoservice.crm.service.interfaces.VehicleService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserService userService;

    @Override
    public Vehicle createVehicleForOwner(UUID ownerId, String make, String model,
                                         Integer yearOfManufacture, String vin,
                                         String licensePlate, java.time.Instant nextInspectionAt) {
        log.debug("Creating vehicle for owner {}", ownerId);

        User owner = userService.getCustomerById(ownerId);

        if (vin != null && !vin.isBlank()) {
            vehicleRepository.findByVin(vin).ifPresent(v -> {
                throw new IllegalArgumentException("Vehicle with VIN " + vin + " already exists");
            });
        }

        if (licensePlate != null && !licensePlate.isBlank()) {
            vehicleRepository.findByLicensePlate(licensePlate).ifPresent(v -> {
                throw new IllegalArgumentException("Vehicle with license plate " + licensePlate + " already exists");
            });
        }

        Vehicle vehicle = Vehicle.builder()
                .owner(owner)
                .make(make)
                .model(model)
                .yearOfManufacture(yearOfManufacture)
                .vin(vin)
                .licensePlate(licensePlate)
                .nextInspectionAt(nextInspectionAt)
                .build();

        return vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public Vehicle getById(UUID id) {
        log.debug("Getting vehicle by id {}", id);

        return vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> getAllVehicles() {
        log.debug("Getting all vehicles");
        return vehicleRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> getByOwner(UUID ownerId) {
        log.debug("Getting vehicles for owner {}", ownerId);

        User owner = userService.getCustomerById(ownerId);

        return vehicleRepository.findByOwner(owner);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> searchVehicles(String query) {
        log.debug("Searching vehicles with query: {}", query);

        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        String searchPattern = "%" + query.trim() + "%";
        return vehicleRepository.searchVehicles(searchPattern);
    }

    @Override
    public Vehicle updateInspectionDate(UUID vehicleId, java.time.Instant nextInspectionAt) {
        log.debug("Updating next inspection date for vehicle {}", vehicleId);
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + vehicleId));
        vehicle.setNextInspectionAt(nextInspectionAt);
        return vehicleRepository.save(vehicle);
    }
}

