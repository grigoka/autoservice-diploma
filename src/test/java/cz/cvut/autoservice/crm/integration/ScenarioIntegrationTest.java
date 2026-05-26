package cz.cvut.autoservice.crm.integration;

import cz.cvut.autoservice.crm.domain.model.User;
import cz.cvut.autoservice.crm.domain.model.Vehicle;
import cz.cvut.autoservice.crm.domain.model.WorkOrder;
import cz.cvut.autoservice.crm.domain.model.enums.UserRole;
import cz.cvut.autoservice.crm.domain.model.enums.WorkOrderStatus;
import cz.cvut.autoservice.crm.domain.repository.UserRepository;
import cz.cvut.autoservice.crm.domain.repository.VehicleRepository;
import cz.cvut.autoservice.crm.domain.repository.WorkOrderRepository;
import cz.cvut.autoservice.crm.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
@Testcontainers
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestPropertySource(properties = {
        "app.notifications.enabled=false"
})
class ScenarioIntegrationTest {

    @Container
    @SuppressWarnings("resource")
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("autoservice")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.url", postgres::getJdbcUrl);
        registry.add("spring.flyway.user", postgres::getUsername);
        registry.add("spring.flyway.password", postgres::getPassword);
    }

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;
    @Autowired
    UserRepository userRepository;
    @Autowired
    VehicleRepository vehicleRepository;
    @Autowired
    WorkOrderRepository workOrderRepository;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    JwtService jwtService;

    @BeforeEach
    void clean() {
        workOrderRepository.deleteAll();
        vehicleRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void scenario_owner_creates_customer_then_login() throws Exception {
        User owner = userRepository.save(User.builder()
                .email("owner@example.com")
                .passwordHash(passwordEncoder.encode("ownerpass"))
                .role(UserRole.OWNER)
                .firstName("Own")
                .lastName("Er")
                .build());

        String email = "cust@example.com";
        String password = "secret123";
        String ownerToken = jwtService.generateToken(owner.getId(), owner.getRole());

        mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "role", "CUSTOMER",
                                "email", email,
                                "password", password,
                                "firstName", "John",
                                "lastName", "Doe"
                        ))))
                .andExpect(status().isCreated());

        var loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "password", password
                        ))))
                .andExpect(status().isOk())
                .andReturn();

        String body = loginResult.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(body).contains("token");
    }

    @Test
    void scenario_owner_creates_vehicle_with_inspection_date_and_order_with_items() throws Exception {
        User owner = userRepository.save(User.builder()
                .email("owner@example.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(UserRole.OWNER)
                .firstName("Own")
                .lastName("Er")
                .build());
        User customer = userRepository.save(User.builder()
                .email("cust2@example.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(UserRole.CUSTOMER)
                .firstName("Cus")
                .lastName("Tomer")
                .build());

        String ownerToken = jwtService.generateToken(owner.getId(), owner.getRole());

        var vehicleRes = mockMvc.perform(post("/api/customers/{customerId}/vehicles", customer.getId())
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "make", "Skoda",
                                "model", "Octavia",
                                "yearOfManufacture", 2020,
                                "vin", "VIN1234567890",
                                "licensePlate", "ABC-123",
                                "nextInspectionAt", Instant.now().toString()
                        ))))
                .andExpect(status().isCreated())
                .andReturn();

        var vehicleId = objectMapper.readTree(vehicleRes.getResponse().getContentAsString()).get("id").asText();

        var orderRes = mockMvc.perform(post("/api/work-orders")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "customerId", customer.getId().toString(),
                                "vehicleId", vehicleId
                        ))))
                .andExpect(status().isCreated())
                .andReturn();
        UUID orderId = UUID.fromString(objectMapper.readTree(orderRes.getResponse().getContentAsString()).get("id").asText());

        mockMvc.perform(post("/api/work-orders/{orderId}/items", orderId)
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "Diagnostics",
                                "details", "Check",
                                "quantity", 1,
                                "unitPrice", 500
                        ))))
                .andExpect(status().isOk());
    }

    @Test
    void customer_cannot_access_foreign_order() throws Exception {
        User customer1 = userRepository.save(User.builder()
                .email("cust1@example.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(UserRole.CUSTOMER)
                .firstName("A")
                .lastName("B")
                .build());
        User customer2 = userRepository.save(User.builder()
                .email("cust2@example.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(UserRole.CUSTOMER)
                .firstName("C")
                .lastName("D")
                .build());

        Vehicle vehicle = vehicleRepository.save(Vehicle.builder()
                .owner(customer1)
                .make("Ford")
                .model("Focus")
                .build());

        WorkOrder order = workOrderRepository.save(WorkOrder.builder()
                .customer(customer1)
                .vehicle(vehicle)
                .status(WorkOrderStatus.DRAFT)
                .build());

        String tokenCustomer2 = jwtService.generateToken(customer2.getId(), customer2.getRole());

        mockMvc.perform(get("/api/me/work-orders/{orderId}", order.getId())
                        .header("Authorization", "Bearer " + tokenCustomer2))
                .andExpect(status().isForbidden());
    }

    @Test
    void mechanic_cannot_access_not_assigned_order() throws Exception {
        User customer = userRepository.save(User.builder()
                .email("cust3@example.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(UserRole.CUSTOMER)
                .firstName("E")
                .lastName("F")
                .build());
        User mechanicAssigned = userRepository.save(User.builder()
                .email("mech1@example.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(UserRole.MECHANIC)
                .firstName("M")
                .lastName("One")
                .build());
        User mechanicOther = userRepository.save(User.builder()
                .email("mech2@example.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(UserRole.MECHANIC)
                .firstName("M")
                .lastName("Two")
                .build());

        Vehicle vehicle = vehicleRepository.save(Vehicle.builder()
                .owner(customer)
                .make("VW")
                .model("Golf")
                .build());

        WorkOrder order = workOrderRepository.save(WorkOrder.builder()
                .customer(customer)
                .vehicle(vehicle)
                .assignedMechanic(mechanicAssigned)
                .status(WorkOrderStatus.IN_PROGRESS)
                .build());

        String tokenOther = jwtService.generateToken(mechanicOther.getId(), mechanicOther.getRole());

        mockMvc.perform(get("/api/me/assigned-work-orders/{orderId}", order.getId())
                        .header("Authorization", "Bearer " + tokenOther))
                .andExpect(status().isForbidden());
    }
}

