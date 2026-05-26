package cz.cvut.autoservice.crm;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/** Run once to print BCrypt hashes for seed SQL. */
public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("admin123: " + encoder.encode("admin123"));
        System.out.println("customer123: " + encoder.encode("customer123"));
        System.out.println("mechanic123: " + encoder.encode("mechanic123"));
    }
}
