package cz.cvut.autoservice.crm.domain.repository;

import cz.cvut.autoservice.crm.domain.model.Vehicle;
import cz.cvut.autoservice.crm.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    List<Vehicle> findByOwner(User owner);

    Optional<Vehicle> findByVin(String vin);

    Optional<Vehicle> findByLicensePlate(String licensePlate);

    @Query("SELECT v FROM Vehicle v WHERE " +
           "LOWER(v.make) LIKE LOWER(:query) OR " +
           "LOWER(v.model) LIKE LOWER(:query) OR " +
           "LOWER(v.vin) LIKE LOWER(:query) OR " +
           "LOWER(v.licensePlate) LIKE LOWER(:query) OR " +
           "LOWER(CONCAT(v.make, ' ', v.model)) LIKE LOWER(:query)")
    List<Vehicle> searchVehicles(@Param("query") String query);

    @Query("SELECT v FROM Vehicle v " +
           "WHERE v.nextInspectionAt IS NOT NULL " +
           "AND v.nextInspectionAt <= :now " +
           "AND (v.lastInspectionReminderAt IS NULL OR v.lastInspectionReminderAt < v.nextInspectionAt)")
    List<Vehicle> findVehiclesDueForInspection(@Param("now") java.time.Instant now);
}
