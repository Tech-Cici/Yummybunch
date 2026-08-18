package com.backend.Yummybunch.web;

import com.backend.Yummybunch.domain.User;
import com.backend.Yummybunch.dto.Dtos.*;
import com.backend.Yummybunch.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    /** Creates an unverified account and emails a 6-digit code. */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        User.Role role;
        try {
            role = User.Role.valueOf(
                    (req.role() == null ? "CUSTOMER" : req.role()).trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Role must be CUSTOMER or RESTAURANT");
        }
        if (role == User.Role.ADMIN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Admin accounts cannot be self-registered");
        }

        auth.register(req.email(), req.password(), req.name(), req.phone(), role,
                req.restaurantName(), req.address(), req.cuisine());

        return ResponseEntity.ok(Map.of(
                "message", "Verification code sent",
                "email", req.email().trim().toLowerCase()));
    }

    /** Confirms the code and logs the user straight in. */
    @PostMapping("/verify")
    public ResponseEntity<AuthResponse> verify(@RequestBody VerifyRequest req) {
        var result = auth.verify(req.email(), req.code());
        return ResponseEntity.ok(new AuthResponse(result.token(), UserView.of(result.user())));
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resend(@RequestBody ResendRequest req) {
        auth.resend(req.email());
        return ResponseEntity.ok(Map.of("message", "A new code is on its way"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        var result = auth.login(req.email(), req.password());
        return ResponseEntity.ok(new AuthResponse(result.token(), UserView.of(result.user())));
    }

    /** Used by the frontend middleware to validate the cookie on each navigation. */
    @GetMapping("/me")
    public ResponseEntity<UserView> me(@AuthenticationPrincipal User user) {
        if (user == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Not signed in");
        return ResponseEntity.ok(UserView.of(user));
    }
}
