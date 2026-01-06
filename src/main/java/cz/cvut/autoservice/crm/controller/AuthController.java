package cz.cvut.autoservice.crm.controller;

import cz.cvut.autoservice.crm.dto.AuthResponse;
import cz.cvut.autoservice.crm.dto.LoginRequest;
import cz.cvut.autoservice.crm.dto.RegisterRequest;
import cz.cvut.autoservice.crm.domain.model.User;
import cz.cvut.autoservice.crm.security.JwtService;
import cz.cvut.autoservice.crm.service.interfaces.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.registerCustomer(
                request.getEmail(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName(),
                request.getPhone(),
                request.getAddressLine1(),
                request.getAddressLine2(),
                request.getCity(),
                request.getZip()
        );

        String token = jwtService.generateToken(user.getId(), user.getRole());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, user.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.authenticate(request.getEmail(), request.getPassword());
        
        String token = jwtService.generateToken(user.getId(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token, user.getRole()));
    }
}

