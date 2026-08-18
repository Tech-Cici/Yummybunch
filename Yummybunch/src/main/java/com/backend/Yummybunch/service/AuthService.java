package com.backend.Yummybunch.service;

import com.backend.Yummybunch.domain.Restaurant;
import com.backend.Yummybunch.domain.User;
import com.backend.Yummybunch.domain.VerificationCode;
import com.backend.Yummybunch.repo.RestaurantRepository;
import com.backend.Yummybunch.repo.UserRepository;
import com.backend.Yummybunch.repo.VerificationCodeRepository;
import com.backend.Yummybunch.security.JwtService;
import com.backend.Yummybunch.web.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

@Service
public class AuthService {

    private static final Duration CODE_TTL = Duration.ofMinutes(10);
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);

    private final UserRepository users;
    private final RestaurantRepository restaurants;
    private final VerificationCodeRepository codes;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final MailService mail;
    private final SecureRandom random = new SecureRandom();

    public AuthService(UserRepository users, RestaurantRepository restaurants,
                       VerificationCodeRepository codes, PasswordEncoder encoder,
                       JwtService jwt, MailService mail) {
        this.users = users;
        this.restaurants = restaurants;
        this.codes = codes;
        this.encoder = encoder;
        this.jwt = jwt;
        this.mail = mail;
    }

    /**
     * Creates an unverified account and emails a code.
     * For a RESTAURANT signup the restaurant row is created at the same time,
     * so the owner has somewhere to put a menu the moment they verify.
     */
    @Transactional
    public void register(String email, String rawPassword, String name, String phone,
                         User.Role role, String restaurantName, String address, String cuisine) {

        String normalised = email == null ? "" : email.trim().toLowerCase();
        if (normalised.isBlank()) throw new ApiException(HttpStatus.BAD_REQUEST, "Email is required");
        if (rawPassword == null || rawPassword.length() < 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }
        if (name == null || name.isBlank()) throw new ApiException(HttpStatus.BAD_REQUEST, "Name is required");

        users.findByEmailIgnoreCase(normalised).ifPresent(existing -> {
            if (existing.isEmailVerified()) {
                throw new ApiException(HttpStatus.CONFLICT, "That email is already registered. Try signing in.");
            }
            // Signed up but never confirmed: let them start over rather than be stuck.
            codes.deleteAll(codes.findByEmailIgnoreCase(normalised));
            restaurants.findByOwnerId(existing.getId()).ifPresent(restaurants::delete);
            users.delete(existing);
            users.flush();
        });

        User user = new User();
        user.setEmail(normalised);
        user.setPasswordHash(encoder.encode(rawPassword));
        user.setName(name.trim());
        user.setPhone(phone);
        user.setRole(role);
        user.setEmailVerified(false);
        users.save(user);

        if (role == User.Role.RESTAURANT) {
            if (restaurantName == null || restaurantName.isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Restaurant name is required");
            }
            Restaurant r = new Restaurant();
            r.setOwner(user);
            r.setName(restaurantName.trim());
            r.setAddress(address);
            r.setCuisine(cuisine);
            r.setPhone(phone);
            r.setDescription("Welcome to " + restaurantName.trim());
            restaurants.save(r);
        }

        issueCode(normalised, user.getName());
    }

    /** Generates, stores and emails a fresh code. */
    @Transactional
    public void issueCode(String email, String name) {
        String code = String.format("%06d", random.nextInt(1_000_000));

        VerificationCode vc = new VerificationCode();
        vc.setEmail(email);
        vc.setCode(code);
        vc.setExpiresAt(Instant.now().plus(CODE_TTL));
        codes.save(vc);

        // If the mail server rejects this, the transaction rolls back and the
        // caller gets a real error — no account left in limbo with no code sent.
        mail.sendVerificationCode(email, name, code);
    }

    @Transactional
    public void resend(String email) {
        String normalised = email == null ? "" : email.trim().toLowerCase();
        User user = users.findByEmailIgnoreCase(normalised)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No account found for that email"));
        if (user.isEmailVerified()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "That email is already verified. You can sign in.");
        }

        codes.findFirstByEmailIgnoreCaseOrderByCreatedAtDesc(normalised).ifPresent(latest -> {
            Duration since = Duration.between(latest.getCreatedAt(), Instant.now());
            if (since.compareTo(RESEND_COOLDOWN) < 0) {
                long wait = RESEND_COOLDOWN.minus(since).toSeconds() + 1;
                throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                        "Please wait " + wait + " seconds before requesting another code.");
            }
        });

        issueCode(normalised, user.getName());
    }

    /** Confirms the address and returns a signed token so the user is logged straight in. */
    @Transactional
    public AuthResult verify(String email, String submittedCode) {
        String normalised = email == null ? "" : email.trim().toLowerCase();
        User user = users.findByEmailIgnoreCase(normalised)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No account found for that email"));

        if (user.isEmailVerified()) {
            // Must NOT return a token here. Doing so handed a valid session to
            // anyone who knew a verified address, since the code is not checked
            // on this path. Make them sign in with the password instead.
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "That email is already verified. Please sign in.");
        }

        VerificationCode vc = codes.findFirstByEmailIgnoreCaseOrderByCreatedAtDesc(normalised)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                        "No code has been sent. Request a new one."));

        if (!vc.isUsable()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    vc.isExpired() ? "That code has expired. Request a new one."
                                   : "That code is no longer valid. Request a new one.");
        }

        if (!vc.getCode().equals(submittedCode == null ? "" : submittedCode.trim())) {
            vc.setAttempts(vc.getAttempts() + 1);
            codes.save(vc);
            int left = Math.max(0, 5 - vc.getAttempts());
            throw new ApiException(HttpStatus.BAD_REQUEST, left == 0
                    ? "Incorrect code. No attempts left — request a new one."
                    : "Incorrect code. " + left + " attempt(s) left.");
        }

        vc.setConsumed(true);
        codes.save(vc);
        user.setEmailVerified(true);
        users.save(user);

        return new AuthResult(jwt.issue(user.getEmail(), user.getRole().name()), user);
    }

    public AuthResult login(String email, String rawPassword) {
        String normalised = email == null ? "" : email.trim().toLowerCase();
        User user = users.findByEmailIgnoreCase(normalised)
                // Same message for unknown email and wrong password, so the endpoint
                // cannot be used to discover which addresses are registered.
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect email or password"));

        if (!encoder.matches(rawPassword == null ? "" : rawPassword, user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect email or password");
        }
        if (!user.isEmailVerified()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED");
        }

        return new AuthResult(jwt.issue(user.getEmail(), user.getRole().name()), user);
    }

    public record AuthResult(String token, User user) {}
}
