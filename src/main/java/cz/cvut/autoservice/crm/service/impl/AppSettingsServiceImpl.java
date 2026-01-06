package cz.cvut.autoservice.crm.service.impl;

import cz.cvut.autoservice.crm.domain.model.AppSettings;
import cz.cvut.autoservice.crm.domain.repository.AppSettingsRepository;
import cz.cvut.autoservice.crm.service.interfaces.AppSettingsService;
import cz.cvut.autoservice.crm.service.model.AppSettingsView;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AppSettingsServiceImpl implements AppSettingsService {

    private final AppSettingsRepository repository;

    @Override
    @Transactional(readOnly = true)
    public AppSettingsView getEffectiveSettings(String defaultHost, Integer defaultPort, String defaultUsername,
                                                String defaultPassword, String defaultFrom, boolean defaultNotificationsEnabled,
                                                java.math.BigDecimal defaultVatRate) {
        Optional<AppSettings> existing = repository.findAll().stream().findFirst();
        if (existing.isEmpty()) {
            return AppSettingsView.builder()
                    .mailHost(defaultHost)
                    .mailPort(defaultPort)
                    .mailUsername(defaultUsername)
                    .mailPassword(defaultPassword)
                    .mailFrom(defaultFrom)
                    .notificationsEnabled(defaultNotificationsEnabled)
                    .vatRate(defaultVatRate)
                    .build();
        }
        AppSettings s = existing.get();
        return AppSettingsView.builder()
                .mailHost(firstNonBlank(s.getMailHost(), defaultHost))
                .mailPort(s.getMailPort() != null ? s.getMailPort() : defaultPort)
                .mailUsername(firstNonBlank(s.getMailUsername(), defaultUsername))
                .mailPassword(firstNonBlank(s.getMailPassword(), defaultPassword))
                .mailFrom(firstNonBlank(s.getMailFrom(), defaultFrom))
                .notificationsEnabled(s.isNotificationsEnabled())
                .vatRate(s.getVatRate() != null ? s.getVatRate() : defaultVatRate)
                .build();
    }

    @Override
    public AppSettingsView updateEmailSettings(String host, Integer port, String username, String password,
                                               String from, boolean notificationsEnabled) {
        AppSettings settings = repository.findAll().stream().findFirst().orElseGet(AppSettings::new);
        settings.setMailHost(host);
        settings.setMailPort(port);
        settings.setMailUsername(username);
        settings.setMailPassword(password);
        settings.setMailFrom(from);
        settings.setNotificationsEnabled(notificationsEnabled);
        AppSettings saved = repository.save(settings);
        log.info("Updated email settings");
        return AppSettingsView.builder()
                .mailHost(saved.getMailHost())
                .mailPort(saved.getMailPort())
                .mailUsername(saved.getMailUsername())
                .mailPassword(saved.getMailPassword())
                .mailFrom(saved.getMailFrom())
                .notificationsEnabled(saved.isNotificationsEnabled())
                .build();
    }

    private String firstNonBlank(String value, String fallback) {
        return (value != null && !value.isBlank()) ? value : fallback;
    }
}

