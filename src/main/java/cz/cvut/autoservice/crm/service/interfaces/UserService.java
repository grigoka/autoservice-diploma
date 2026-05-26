package cz.cvut.autoservice.crm.service.interfaces;

import cz.cvut.autoservice.crm.domain.model.User;
import cz.cvut.autoservice.crm.domain.model.enums.UserRole;

import java.util.List;
import java.util.UUID;

public interface UserService {

    User getById(UUID id);

    User getCustomerById(UUID id);

    boolean existsByEmail(String email);

    User createUserByOwner(UserRole role, String email, String password, String firstName, String lastName,
                           String phone, String addressLine1, String addressLine2, String city, String zip);

    User authenticate(String email, String password);

    List<User> getAllCustomers();

    List<User> getAllMechanics();

    User updateUser(UUID userId, String firstName, String lastName, String email,
                     String phone, String addressLine1, String addressLine2, String city, String zip);

    User assignRole(UUID userId, UserRole role);

    List<User> searchUsers(String query);
}
