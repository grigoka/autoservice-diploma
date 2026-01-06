package cz.cvut.autoservice.crm.controller;

import cz.cvut.autoservice.crm.dto.EmailSettingsRequest;
import cz.cvut.autoservice.crm.service.interfaces.AppSettingsService;
import cz.cvut.autoservice.crm.service.model.AppSettingsView;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final AppSettingsService appSettingsService;

    @PostMapping("/email")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<AppSettingsView> updateEmailSettings(@Valid @RequestBody EmailSettingsRequest request) {
        AppSettingsView settings = appSettingsService.updateEmailSettings(
                request.getHost(),
                request.getPort(),
                request.getUsername(),
                request.getPassword(),
                request.getFrom(),
                request.getNotificationsEnabled()
        );
        return ResponseEntity.ok(settings);
    }
}

