package cz.cvut.autoservice.crm.service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppSettingsView {
    private String mailHost;
    private Integer mailPort;
    private String mailUsername;
    private String mailPassword;
    private String mailFrom;
    private boolean notificationsEnabled;
    private java.math.BigDecimal vatRate;
}

