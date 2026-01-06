package cz.cvut.autoservice.crm.service.impl;

import cz.cvut.autoservice.crm.domain.model.WorkOrder;
import cz.cvut.autoservice.crm.domain.model.Vehicle;
import cz.cvut.autoservice.crm.domain.model.enums.WorkOrderStatus;
import cz.cvut.autoservice.crm.service.interfaces.AppSettingsService;
import cz.cvut.autoservice.crm.service.interfaces.NotificationService;
import cz.cvut.autoservice.crm.service.model.AppSettingsView;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Properties;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService implements NotificationService {

    private final AppSettingsService appSettingsService;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String defaultHost;
    @Value("${spring.mail.port:587}")
    private Integer defaultPort;
    @Value("${spring.mail.username:}")
    private String defaultUsername;
    @Value("${spring.mail.password:}")
    private String defaultPassword;
    @Value("${spring.mail.from:autoservice@example.com}")
    private String defaultFrom;
    @Value("${app.notifications.enabled:true}")
    private boolean defaultNotificationsEnabled;
    @Value("${app.vat.default-rate:0.21}")
    private java.math.BigDecimal defaultVatRate;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm", Locale.US);
    private static final NumberFormat CURRENCY_FORMATTER = NumberFormat.getCurrencyInstance(Locale.US);

    @Override
    public void notifyStatusChange(WorkOrder workOrder, WorkOrderStatus oldStatus, WorkOrderStatus newStatus) {
        AppSettingsView settings = appSettingsService.getEffectiveSettings(defaultHost, defaultPort, defaultUsername,
                defaultPassword, defaultFrom, defaultNotificationsEnabled, defaultVatRate);
        if (!settings.isNotificationsEnabled()) {
            log.debug("Notifications are disabled, skipping status change notification for work order {}", workOrder.getId());
            return;
        }

        if (shouldNotifyStatusChange(oldStatus, newStatus)) {
            try {
                sendStatusChangeEmail(workOrder, oldStatus, newStatus, settings);
                log.info("Status change notification sent for work order {}: {} -> {}", 
                        workOrder.getId(), oldStatus, newStatus);
            } catch (Exception e) {
                log.error("Failed to send status change notification for work order {}", 
                        workOrder.getId(), e);
            }
        }
    }

    @Override
    public void notifyOrderCompletion(WorkOrder workOrder) {
        AppSettingsView settings = appSettingsService.getEffectiveSettings(defaultHost, defaultPort, defaultUsername,
                defaultPassword, defaultFrom, defaultNotificationsEnabled, defaultVatRate);
        if (!settings.isNotificationsEnabled()) {
            log.debug("Notifications are disabled, skipping completion notification for work order {}", workOrder.getId());
            return;
        }

        try {
            sendCompletionEmail(workOrder, settings);
            log.info("Completion notification sent for work order {}", workOrder.getId());
        } catch (Exception e) {
            log.error("Failed to send completion notification for work order {}", 
                    workOrder.getId(), e);
        }
    }

    @Override
    public void notifyInspectionReminder(Vehicle vehicle) {
        AppSettingsView settings = appSettingsService.getEffectiveSettings(defaultHost, defaultPort, defaultUsername,
                defaultPassword, defaultFrom, defaultNotificationsEnabled, defaultVatRate);
        if (!settings.isNotificationsEnabled()) {
            log.debug("Notifications are disabled, skipping inspection reminder for vehicle {}", vehicle.getId());
            return;
        }

        String customerEmail = vehicle.getOwner().getEmail();
        if (!StringUtils.hasText(customerEmail)) {
            log.warn("Owner {} has no email address, cannot send inspection reminder", vehicle.getOwner().getId());
            return;
        }

        try {
            JavaMailSenderImpl sender = buildMailSender(settings);
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(settings.getMailFrom());
            helper.setTo(customerEmail);
        helper.setSubject("Inspection reminder - your vehicle");
            helper.setText(buildInspectionReminderBody(vehicle), true);

            sender.send(message);
            log.info("Inspection reminder sent for vehicle {}", vehicle.getId());
        } catch (Exception e) {
            log.error("Failed to send inspection reminder for vehicle {}", vehicle.getId(), e);
        }
    }

    private boolean shouldNotifyStatusChange(WorkOrderStatus oldStatus, WorkOrderStatus newStatus) {
        if (newStatus == WorkOrderStatus.WAITING_FOR_APPROVAL) {
            return true;
        }
        if (newStatus == WorkOrderStatus.IN_PROGRESS) {
            return true;
        }
        if (newStatus == WorkOrderStatus.READY) {
            return true;
        }
        return newStatus == WorkOrderStatus.CANCELED;
    }

    private void sendStatusChangeEmail(WorkOrder workOrder, WorkOrderStatus oldStatus, WorkOrderStatus newStatus, AppSettingsView settings) 
            throws MessagingException {
        String customerEmail = workOrder.getCustomer().getEmail();
        if (!StringUtils.hasText(customerEmail)) {
            log.warn("Customer {} has no email address, cannot send notification", 
                    workOrder.getCustomer().getId());
            return;
        }

        JavaMailSenderImpl sender = buildMailSender(settings);
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(settings.getMailFrom());
        helper.setTo(customerEmail);
        helper.setSubject(getStatusChangeSubject(workOrder, newStatus));
        helper.setText(buildStatusChangeEmailBody(workOrder, oldStatus, newStatus), true);

        sender.send(message);
    }

    private void sendCompletionEmail(WorkOrder workOrder, AppSettingsView settings) throws MessagingException {
        String customerEmail = workOrder.getCustomer().getEmail();
        if (!StringUtils.hasText(customerEmail)) {
            log.warn("Customer {} has no email address, cannot send completion notification", 
                    workOrder.getCustomer().getId());
            return;
        }

        JavaMailSenderImpl sender = buildMailSender(settings);
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(settings.getMailFrom());
        helper.setTo(customerEmail);
        helper.setSubject("Your vehicle is ready for pickup - Order #" + workOrder.getId().toString().substring(0, 8));
        helper.setText(buildCompletionEmailBody(workOrder), true);

        sender.send(message);
    }

    private JavaMailSenderImpl buildMailSender(AppSettingsView settings) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(settings.getMailHost());
        sender.setPort(settings.getMailPort());
        sender.setUsername(settings.getMailUsername());
        sender.setPassword(settings.getMailPassword());

        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        return sender;
    }

    private String buildInspectionReminderBody(Vehicle vehicle) {
        StringBuilder body = new StringBuilder();
        body.append("<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>");
        body.append("<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>");

        body.append("<h2 style='color: #2c3e50;'>Inspection reminder</h2>");

        body.append("<p>Dear ").append(vehicle.getOwner().getFirstName()).append(" ")
                .append(vehicle.getOwner().getLastName()).append(",</p>");

        body.append("<p>This is a reminder about the regular technical inspection of your vehicle.</p>");

        body.append("<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>");
        body.append("<p><strong>Vehicle:</strong> ").append(vehicle.getMake()).append(" ").append(vehicle.getModel());
        if (vehicle.getLicensePlate() != null) {
            body.append(" (").append(vehicle.getLicensePlate()).append(")");
        }
        body.append("</p>");
        if (vehicle.getNextInspectionAt() != null) {
            ZonedDateTime dt = vehicle.getNextInspectionAt().atZone(ZoneId.systemDefault());
            body.append("<p><strong>Recommended date:</strong> ").append(dt.format(DATE_FORMATTER)).append("</p>");
        }
        body.append("</div>");

        body.append("<p>We recommend performing the inspection every 6 months. Please contact us to schedule an appointment.</p>");

        body.append("<hr style='border: none; border-top: 1px solid #ddd; margin: 30px 0;'>");
        body.append("<p style='color: #666; font-size: 0.9em;'>This email was generated automatically by the AutoService CRM system.</p>");

        body.append("</div></body></html>");
        return body.toString();
    }

    private String getStatusChangeSubject(WorkOrder workOrder, WorkOrderStatus newStatus) {
        String orderIdShort = workOrder.getId().toString().substring(0, 8);
        return switch (newStatus) {
            case WAITING_FOR_APPROVAL -> "Waiting for your approval - Order #" + orderIdShort;
            case IN_PROGRESS -> "Repair started - Order #" + orderIdShort;
            case READY -> "Vehicle ready for pickup - Order #" + orderIdShort;
            case CANCELED -> "Work order canceled - Order #" + orderIdShort;
            default -> "Work order status updated - Order #" + orderIdShort;
        };
    }

    private String buildStatusChangeEmailBody(WorkOrder workOrder, WorkOrderStatus oldStatus, WorkOrderStatus newStatus) {
        StringBuilder body = new StringBuilder();
        body.append("<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>");
        body.append("<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>");
        
        body.append("<h2 style='color: #2c3e50;'>Work order status changed</h2>");
        
        body.append("<p>Dear ").append(workOrder.getCustomer().getFirstName())
                .append(" ").append(workOrder.getCustomer().getLastName()).append(",</p>");
        
        body.append("<p>The status of your service order has been updated:</p>");
        
        body.append("<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>");
        body.append("<p><strong>Order ID:</strong> ").append(workOrder.getId()).append("</p>");
        body.append("<p><strong>Vehicle:</strong> ").append(workOrder.getVehicle().getMake())
                .append(" ").append(workOrder.getVehicle().getModel());
        if (workOrder.getVehicle().getLicensePlate() != null) {
            body.append(" (").append(workOrder.getVehicle().getLicensePlate()).append(")");
        }
        body.append("</p>");
        if (oldStatus != null) {
            body.append("<p><strong>Previous status:</strong> ").append(translateStatus(oldStatus)).append("</p>");
        }
        body.append("<p><strong>New status:</strong> <span style='color: #27ae60; font-weight: bold;'>")
                .append(translateStatus(newStatus)).append("</span></p>");
        body.append("</div>");

        if (newStatus == WorkOrderStatus.WAITING_FOR_APPROVAL) {
            body.append("<p style='background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;'>");
            body.append("<strong>Action required:</strong> Please review the cost estimate and approve the work order.");
            body.append("</p>");
        } else if (newStatus == WorkOrderStatus.IN_PROGRESS) {
            body.append("<p>Work on your vehicle has started. We will keep you updated.</p>");
        } else if (newStatus == WorkOrderStatus.READY) {
            body.append("<p style='background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;'>");
            body.append("<strong>The vehicle is ready for pickup.</strong> You can come to collect it.");
            body.append("</p>");
        } else if (newStatus == WorkOrderStatus.CANCELED) {
            body.append("<p style='background-color: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;'>");
            body.append("The work order was canceled. If you have any questions, please contact us.");
            body.append("</p>");
        }

        if (workOrder.getItems() != null && !workOrder.getItems().isEmpty()) {
            body.append("<h3 style='color: #2c3e50; margin-top: 30px;'>Order summary:</h3>");
            body.append("<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>");
            body.append("<thead><tr style='background-color: #34495e; color: white;'>");
            body.append("<th style='padding: 10px; text-align: left;'>Item</th>");
            body.append("<th style='padding: 10px; text-align: right;'>Quantity</th>");
            body.append("<th style='padding: 10px; text-align: right;'>Price</th>");
            body.append("</tr></thead><tbody>");
            
            for (var item : workOrder.getItems()) {
                body.append("<tr style='border-bottom: 1px solid #ddd;'>");
                body.append("<td style='padding: 10px;'>").append(item.getTitle());
                if (item.getDetails() != null && !item.getDetails().isEmpty()) {
                    body.append("<br><small style='color: #666;'>").append(item.getDetails()).append("</small>");
                }
                body.append("</td>");
                body.append("<td style='padding: 10px; text-align: right;'>").append(item.getQuantity()).append("</td>");
                body.append("<td style='padding: 10px; text-align: right;'>")
                        .append(CURRENCY_FORMATTER.format(item.getLineTotal())).append("</td>");
                body.append("</tr>");
            }
            
            body.append("</tbody></table>");
            
            body.append("<div style='text-align: right; margin-top: 20px;'>");
            body.append("<p><strong>Subtotal:</strong> ").append(CURRENCY_FORMATTER.format(workOrder.getSubtotal())).append("</p>");
            body.append("<p><strong>VAT (").append(workOrder.getVatRate().multiply(BigDecimal.valueOf(100)).intValue())
                    .append("%):</strong> ").append(CURRENCY_FORMATTER.format(workOrder.getVatAmount())).append("</p>");
            body.append("<p style='font-size: 1.2em; font-weight: bold; color: #2c3e50;'><strong>Total:</strong> ")
                    .append(CURRENCY_FORMATTER.format(workOrder.getTotal())).append("</p>");
            body.append("</div>");
        }

        body.append("<hr style='border: none; border-top: 1px solid #ddd; margin: 30px 0;'>");
        body.append("<p style='color: #666; font-size: 0.9em;'>This email was generated automatically by the AutoService CRM system.</p>");
        ZonedDateTime updatedAt = workOrder.getUpdatedAt().atZone(ZoneId.systemDefault());
        body.append("<p style='color: #666; font-size: 0.9em;'>Date: ")
                .append(updatedAt.format(DATE_FORMATTER)).append("</p>");
        
        body.append("</div></body></html>");
        return body.toString();
    }

    private String buildCompletionEmailBody(WorkOrder workOrder) {
        StringBuilder body = new StringBuilder();
        body.append("<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>");
        body.append("<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>");
        
        body.append("<h2 style='color: #27ae60;'>Your vehicle is ready for pickup!</h2>");
        
        body.append("<p>Dear ").append(workOrder.getCustomer().getFirstName())
                .append(" ").append(workOrder.getCustomer().getLastName()).append(",</p>");
        
        body.append("<p style='background-color: #d4edda; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 5px;'>");
        body.append("<strong style='font-size: 1.1em;'>The repair of your vehicle has been completed and it is ready for pickup.</strong>");
        body.append("</p>");
        
        body.append("<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>");
        body.append("<p><strong>Order ID:</strong> ").append(workOrder.getId()).append("</p>");
        body.append("<p><strong>Vehicle:</strong> ").append(workOrder.getVehicle().getMake())
                .append(" ").append(workOrder.getVehicle().getModel());
        if (workOrder.getVehicle().getLicensePlate() != null) {
            body.append(" (").append(workOrder.getVehicle().getLicensePlate()).append(")");
        }
        body.append("</p>");
        if (workOrder.getAssignedMechanic() != null) {
            body.append("<p><strong>Mechanic:</strong> ").append(workOrder.getAssignedMechanic().getFullName()).append("</p>");
        }
        body.append("</div>");

        if (workOrder.getItems() != null && !workOrder.getItems().isEmpty()) {
            body.append("<h3 style='color: #2c3e50; margin-top: 30px;'>Summary of completed work:</h3>");
            body.append("<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>");
            body.append("<thead><tr style='background-color: #34495e; color: white;'>");
            body.append("<th style='padding: 10px; text-align: left;'>Item</th>");
            body.append("<th style='padding: 10px; text-align: right;'>Quantity</th>");
            body.append("<th style='padding: 10px; text-align: right;'>Price</th>");
            body.append("</tr></thead><tbody>");
            
            for (var item : workOrder.getItems()) {
                body.append("<tr style='border-bottom: 1px solid #ddd;'>");
                body.append("<td style='padding: 10px;'>").append(item.getTitle());
                if (item.getDetails() != null && !item.getDetails().isEmpty()) {
                    body.append("<br><small style='color: #666;'>").append(item.getDetails()).append("</small>");
                }
                body.append("</td>");
                body.append("<td style='padding: 10px; text-align: right;'>").append(item.getQuantity()).append("</td>");
                body.append("<td style='padding: 10px; text-align: right;'>")
                        .append(CURRENCY_FORMATTER.format(item.getLineTotal())).append("</td>");
                body.append("</tr>");
            }
            
            body.append("</tbody></table>");
            
            body.append("<div style='text-align: right; margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;'>");
            body.append("<p><strong>Subtotal:</strong> ").append(CURRENCY_FORMATTER.format(workOrder.getSubtotal())).append("</p>");
            body.append("<p><strong>VAT (").append(workOrder.getVatRate().multiply(BigDecimal.valueOf(100)).intValue())
                    .append("%):</strong> ").append(CURRENCY_FORMATTER.format(workOrder.getVatAmount())).append("</p>");
            body.append("<p style='font-size: 1.3em; font-weight: bold; color: #2c3e50; margin-top: 10px;'><strong>Total amount due:</strong> ")
                    .append(CURRENCY_FORMATTER.format(workOrder.getTotal())).append("</p>");
            body.append("</div>");
        }

        body.append("<div style='background-color: #e7f3ff; padding: 20px; border-left: 4px solid #2196F3; margin: 30px 0; border-radius: 5px;'>");
        body.append("<h3 style='color: #1976D2; margin-top: 0;'>Pickup information:</h3>");
        body.append("<p>Please collect your vehicle as soon as possible. If you have any questions, feel free to contact us.</p>");
        body.append("</div>");

        body.append("<hr style='border: none; border-top: 1px solid #ddd; margin: 30px 0;'>");
        body.append("<p style='color: #666; font-size: 0.9em;'>This email was generated automatically by the AutoService CRM system.</p>");
        ZonedDateTime updatedAt = workOrder.getUpdatedAt().atZone(ZoneId.systemDefault());
        body.append("<p style='color: #666; font-size: 0.9em;'>Completion date: ")
                .append(updatedAt.format(DATE_FORMATTER)).append("</p>");
        
        body.append("</div></body></html>");
        return body.toString();
    }

    private String translateStatus(WorkOrderStatus status) {
        return switch (status) {
            case DRAFT -> "Draft";
            case WAITING_FOR_APPROVAL -> "Waiting for approval";
            case IN_PROGRESS -> "In progress";
            case READY -> "Ready for pickup";
            case DONE -> "Completed";
            case CANCELED -> "Canceled";
        };
    }
}

