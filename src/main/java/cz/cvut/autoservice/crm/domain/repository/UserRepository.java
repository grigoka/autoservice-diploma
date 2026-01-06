package cz.cvut.autoservice.crm.domain.repository;

import cz.cvut.autoservice.crm.domain.model.User;
import cz.cvut.autoservice.crm.domain.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    List<User> findByRole(UserRole role);

    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(:query) OR " +
           "LOWER(u.lastName) LIKE LOWER(:query) OR " +
           "LOWER(u.email) LIKE LOWER(:query) OR " +
           "LOWER(u.phone) LIKE LOWER(:query) OR " +
           "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(:query)")
    List<User> searchUsers(@Param("query") String query);
}
