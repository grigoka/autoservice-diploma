package cz.cvut.autoservice.crm.dto;

import cz.cvut.autoservice.crm.domain.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private UserRole role;
    private String firstName;
    private String lastName;
    private String phone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String zip;
    private Instant createdAt;
    private Instant updatedAt;
}

