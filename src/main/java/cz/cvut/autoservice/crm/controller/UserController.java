package cz.cvut.autoservice.crm.controller;

import cz.cvut.autoservice.crm.dto.AssignRoleRequest;
import cz.cvut.autoservice.crm.dto.UpdateUserRequest;
import cz.cvut.autoservice.crm.dto.UserResponse;
import cz.cvut.autoservice.crm.domain.model.User;
import cz.cvut.autoservice.crm.security.CurrentUser;
import cz.cvut.autoservice.crm.service.interfaces.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('OWNER', 'CUSTOMER', 'MECHANIC')")
    public ResponseEntity<UserResponse> getCurrentUser() {
        UUID userId = CurrentUser.getId();
        User user = userService.getById(userId);
        return ResponseEntity.ok(mapToUserResponse(user));
    }

    @GetMapping("/customers")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<UserResponse>> getAllCustomers() {
        List<User> customers = userService.getAllCustomers();
        List<UserResponse> responses = customers.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/customers/{customerId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<UserResponse> getCustomerById(@PathVariable UUID customerId) {
        User customer = userService.getCustomerById(customerId);
        return ResponseEntity.ok(mapToUserResponse(customer));
    }

    @PutMapping("/customers/{customerId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<UserResponse> updateCustomer(
            @PathVariable UUID customerId,
            @Valid @RequestBody UpdateUserRequest request) {
        User updatedUser = userService.updateUser(
                customerId,
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPhone(),
                request.getAddressLine1(),
                request.getAddressLine2(),
                request.getCity(),
                request.getZip()
        );
        return ResponseEntity.ok(mapToUserResponse(updatedUser));
    }

    @PutMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<UserResponse> assignRole(
            @PathVariable UUID userId,
            @Valid @RequestBody AssignRoleRequest request) {
        User updatedUser = userService.assignRole(userId, request.getRole());
        return ResponseEntity.ok(mapToUserResponse(updatedUser));
    }

    @GetMapping("/search/users")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String q) {
        List<User> users = userService.searchUsers(q);
        List<UserResponse> responses = users.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .addressLine1(user.getAddressLine1())
                .addressLine2(user.getAddressLine2())
                .city(user.getCity())
                .zip(user.getZip())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

