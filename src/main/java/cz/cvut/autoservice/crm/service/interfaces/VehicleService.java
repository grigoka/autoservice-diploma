package cz.cvut.autoservice.crm.service.interfaces;

import cz.cvut.autoservice.crm.domain.model.Vehicle;

import java.util.List;
import java.util.UUID;

public interface VehicleService {

    Vehicle createVehicleForOwner(UUID ownerId,
                                  String make,
                                  String model,
                                  Integer yearOfManufacture,
                                  String vin,
                                  String licensePlate,
                                  java.time.Instant nextInspectionAt);

    Vehicle getById(UUID id);

    List<Vehicle> getByOwner(UUID ownerId);

    List<Vehicle> searchVehicles(String query);

    Vehicle updateInspectionDate(UUID vehicleId, java.time.Instant nextInspectionAt);
}
