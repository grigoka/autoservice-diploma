package cz.cvut.autoservice.crm.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class CurrentUser {
    
    public static UUID getId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof String) {
            return UUID.fromString((String) authentication.getPrincipal());
        }
        throw new IllegalStateException("User not authenticated");
    }
}

