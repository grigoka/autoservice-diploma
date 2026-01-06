package cz.cvut.autoservice.crm.domain.model;

import cz.cvut.autoservice.crm.domain.model.base.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "app_settings")
@Getter
@Setter
public class AppSettings extends AuditableEntity {

    @Column(name = "mail_host", length = 150)
    private String mailHost;

    @Column(name = "mail_port")
    private Integer mailPort;

    @Column(name = "mail_username", length = 150)
    private String mailUsername;

    @Column(name = "mail_password", length = 200)
    private String mailPassword;

    @Column(name = "mail_from", length = 150)
    private String mailFrom;

    @Column(name = "notifications_enabled", nullable = false)
    private boolean notificationsEnabled = true;

    @Column(name = "vat_rate", precision = 12, scale = 2)
    private java.math.BigDecimal vatRate;
}

