package com.carfolio.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuthTokenRepository extends JpaRepository<AuthToken, UUID> {

    Optional<AuthToken> findByTokenAndType(String token, AuthTokenType type);

    void deleteByUser_IdAndType(UUID userId, AuthTokenType type);
}
