package cz.cvut.autoservice.crm.service.interfaces;

import cz.cvut.autoservice.crm.service.model.AppSettingsView;

public interface AppSettingsService {

    AppSettingsView getEffectiveSettings(String defaultHost, Integer defaultPort, String defaultUsername,
                                         String defaultPassword, String defaultFrom, boolean defaultNotificationsEnabled,
                                         java.math.BigDecimal defaultVatRate);

    AppSettingsView updateEmailSettings(String host, Integer port, String username, String password,
                                        String from, boolean notificationsEnabled);
}

