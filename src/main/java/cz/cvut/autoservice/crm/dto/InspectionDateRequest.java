package cz.cvut.autoservice.crm.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class InspectionDateRequest {
    @NotNull
    private Instant nextInspectionAt;
}

