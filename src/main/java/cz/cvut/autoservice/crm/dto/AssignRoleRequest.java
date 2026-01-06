package cz.cvut.autoservice.crm.dto;

import cz.cvut.autoservice.crm.domain.model.enums.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignRoleRequest {
    
    @NotNull(message = "Role is required")
    private UserRole role;
}

