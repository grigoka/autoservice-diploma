package cz.cvut.autoservice.crm.domain.model;

import cz.cvut.autoservice.crm.domain.model.base.AuditableEntity;
import cz.cvut.autoservice.crm.domain.model.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email", columnNames = "email")
        },
        indexes = {
                @Index(name = "ix_users_email", columnList = "email"),
                @Index(name = "ix_users_phone", columnList = "phone")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends AuditableEntity {

    @Email
    @NotBlank
    @Column(nullable = false, length = 150)
    private String email;

    @NotBlank
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private UserRole role;

    @NotBlank
    @Column(name = "first_name", nullable = false, length = 80)
    private String firstName;

    @NotBlank
    @Column(name = "last_name", nullable = false, length = 80)
    private String lastName;

    @Column(length = 32)
    private String phone;

    @Column(name = "address_line1", length = 150)
    private String addressLine1;

    @Column(name = "address_line2", length = 150)
    private String addressLine2;

    @Column(length = 80)
    private String city;

    @Column(length = 16)
    private String zip;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
