package com.backend.Yummybunch.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * A single-use 6-digit email confirmation code.
 * Codes expire, and a consumed code can never be replayed.
 */
@Getter
@Setter
@Entity
@Table(name = "verification_codes", indexes = @Index(columnList = "email"))
public class VerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private boolean consumed = false;

    /** Guards against brute-forcing a 6-digit code. */
    @Column(nullable = false)
    private int attempts = 0;

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isUsable() {
        return !consumed && !isExpired() && attempts < 5;
    }
}
