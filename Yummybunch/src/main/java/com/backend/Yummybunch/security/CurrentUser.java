package com.backend.Yummybunch.security;

import com.backend.Yummybunch.domain.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

/** Reads the authenticated User set by {@link JwtAuthFilter}. */
@Component
public class CurrentUser {

    public User require() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(UNAUTHORIZED, "Sign in to continue");
        }
        return user;
    }

    /** @return the signed-in user, or null when the request is anonymous. */
    public User orNull() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getPrincipal() instanceof User user) ? user : null;
    }
}
