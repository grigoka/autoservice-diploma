package cz.cvut.autoservice.crm.dto;

import cz.cvut.autoservice.crm.domain.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserRole role;
}

