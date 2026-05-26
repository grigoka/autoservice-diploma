package cz.cvut.autoservice.crm.service.impl;

import cz.cvut.autoservice.crm.domain.model.User;
import cz.cvut.autoservice.crm.domain.model.enums.UserRole;
import cz.cvut.autoservice.crm.domain.repository.UserRepository;
import cz.cvut.autoservice.crm.service.interfaces.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public User getById(UUID id) {
        log.debug("Getting user by id {}", id);

        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public User getCustomerById(UUID id) {
        log.debug("Getting customer by id {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        if (user.getRole() != UserRole.CUSTOMER) {
            throw new IllegalArgumentException("User with id " + id + " is not a CUSTOMER");
        }

        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        log.debug("Checking if user exists with email {}", email);

        return userRepository.existsByEmail(email);
    }

    @Override
    public User createUserByOwner(UserRole role, String email, String password, String firstName, String lastName,
                                    String phone, String addressLine1, String addressLine2, String city, String zip) {
        log.debug("Owner creating user with email {} and role {}", email, role);

        if (role != UserRole.CUSTOMER && role != UserRole.MECHANIC) {
            throw new IllegalArgumentException("Only CUSTOMER or MECHANIC accounts can be created");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with email " + email + " already exists");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .firstName(firstName)
                .lastName(lastName)
                .phone(phone)
                .addressLine1(addressLine1)
                .addressLine2(addressLine2)
                .city(city)
                .zip(zip)
                .build();

        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User authenticate(String email, String password) {
        log.debug("\n\n\n Authenticating user with email {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllCustomers() {
        log.debug("Getting all customers");

        return userRepository.findByRole(UserRole.CUSTOMER);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllMechanics() {
        log.debug("Getting all mechanics");

        return userRepository.findByRole(UserRole.MECHANIC);
    }

    @Override
    public User updateUser(UUID userId, String firstName, String lastName, String email,
                           String phone, String addressLine1, String addressLine2, String city, String zip) {
        log.debug("Updating user {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        if (email != null && !email.equals(user.getEmail())) {
            if (userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("User with email " + email + " already exists");
            }
            user.setEmail(email);
        }

        if (firstName != null) {
            user.setFirstName(firstName);
        }
        if (lastName != null) {
            user.setLastName(lastName);
        }
        if (phone != null) {
            user.setPhone(phone);
        }
        if (addressLine1 != null) {
            user.setAddressLine1(addressLine1);
        }
        if (addressLine2 != null) {
            user.setAddressLine2(addressLine2);
        }
        if (city != null) {
            user.setCity(city);
        }
        if (zip != null) {
            user.setZip(zip);
        }

        return userRepository.save(user);
    }

    @Override
    public User assignRole(UUID userId, UserRole role) {
        log.debug("Assigning role {} to user {}", role, userId);

        if (role == UserRole.OWNER) {
            throw new IllegalArgumentException("OWNER role cannot be assigned via API");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        user.setRole(role);
        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> searchUsers(String query) {
        log.debug("Searching users with query: {}", query);

        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        String searchPattern = "%" + query.trim().toLowerCase() + "%";
        return userRepository.searchUsers(searchPattern);
    }
}

