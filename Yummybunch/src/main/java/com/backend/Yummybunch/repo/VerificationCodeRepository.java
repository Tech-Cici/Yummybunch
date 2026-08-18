package com.backend.Yummybunch.repo;

import com.backend.Yummybunch.domain.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    /** Most recent code for an address, so an older one cannot be reused. */
    Optional<VerificationCode> findFirstByEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    List<VerificationCode> findByEmailIgnoreCase(String email);
}
