package com.carfolio.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PendingSignupRepository extends JpaRepository<PendingSignup, java.util.UUID> {

    Optional<PendingSignup> findByEmail(String email);

    void deleteByEmail(String email);
}
