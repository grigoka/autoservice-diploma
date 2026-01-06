package cz.cvut.autoservice.crm.domain.repository;

import cz.cvut.autoservice.crm.domain.model.AppSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AppSettingsRepository extends JpaRepository<AppSettings, UUID> {
}

