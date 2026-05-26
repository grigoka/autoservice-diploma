package cz.cvut.autoservice.crm.dto;

import cz.cvut.autoservice.crm.domain.model.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserRequest {

    /**
     * Only {@link UserRole#CUSTOMER} or {@link UserRole#MECHANIC} — enforced in service.
     */
    @NotNull
    private UserRole role;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private String phone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String zip;
}
