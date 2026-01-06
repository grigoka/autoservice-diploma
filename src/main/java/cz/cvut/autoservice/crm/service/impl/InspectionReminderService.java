package cz.cvut.autoservice.crm.service.impl;

import cz.cvut.autoservice.crm.domain.model.Vehicle;
import cz.cvut.autoservice.crm.domain.repository.VehicleRepository;
import cz.cvut.autoservice.crm.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InspectionReminderService {

    private final VehicleRepository vehicleRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void sendInspectionReminders() {
        Instant now = Instant.now();
        List<Vehicle> dueVehicles = vehicleRepository.findVehiclesDueForInspection(now);
        if (dueVehicles.isEmpty()) {
            return;
        }

        log.info("Sending inspection reminders for {} vehicles", dueVehicles.size());
        for (Vehicle vehicle : dueVehicles) {
            notificationService.notifyInspectionReminder(vehicle);

            Instant next = (vehicle.getNextInspectionAt() != null)
                    ? vehicle.getNextInspectionAt().plus(12, ChronoUnit.MONTHS)
                    : now.plus(12, ChronoUnit.MONTHS);
            vehicle.setLastInspectionReminderAt(now);
            vehicle.setNextInspectionAt(next);
        }
        vehicleRepository.saveAll(dueVehicles);
    }
}

