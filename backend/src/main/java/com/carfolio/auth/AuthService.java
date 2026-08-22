package com.carfolio.auth;

import com.carfolio.auth.dto.AuthResponse;
import com.carfolio.auth.dto.LoginRequest;
import com.carfolio.auth.dto.RefreshRequest;
import com.carfolio.auth.dto.SignupConfirmRequest;
import com.carfolio.auth.dto.SignupRequest;
import com.carfolio.common.exception.ApiException;
import com.carfolio.security.JwtService;
import com.carfolio.user.User;
import com.carfolio.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

@Service
public class AuthService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthTokenRepository authTokenRepository;
    private final PendingSignupRepository pendingSignupRepository;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
                        AuthTokenRepository authTokenRepository, PendingSignupRepository pendingSignupRepository,
                        EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authTokenRepository = authTokenRepository;
        this.pendingSignupRepository = pendingSignupRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void requestSignup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_TAKEN", "An account with this email already exists");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new ApiException(HttpStatus.CONFLICT, "USERNAME_TAKEN", "This username is already taken");
        }

        pendingSignupRepository.deleteByEmail(request.email());

        PendingSignup pending = new PendingSignup();
        pending.setName(request.name());
        pending.setUsername(request.username());
        pending.setEmail(request.email());
        pending.setPasswordHash(passwordEncoder.encode(request.password()));
        pending.setCode(generateNumericCode());
        pending.setExpiresAt(Instant.now().plus(15, ChronoUnit.MINUTES));
        pending = pendingSignupRepository.save(pending);

        emailService.sendSignupCode(pending.getEmail(), pending.getName(), pending.getCode());
    }

    @Transactional
    public AuthResponse confirmSignup(SignupConfirmRequest request) {
        PendingSignup pending = pendingSignupRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_CODE", "This code is invalid or has expired"));

        if (pending.isExpired() || !pending.getCode().equals(request.code())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_CODE", "This code is invalid or has expired");
        }
        if (userRepository.existsByEmail(pending.getEmail()) || userRepository.existsByUsername(pending.getUsername())) {
            pendingSignupRepository.delete(pending);
            throw new ApiException(HttpStatus.CONFLICT, "ALREADY_TAKEN", "That email or username was taken while you were verifying — start over");
        }

        User user = new User();
        user.setName(pending.getName());
        user.setUsername(pending.getUsername());
        user.setEmail(pending.getEmail());
        user.setPasswordHash(pending.getPasswordHash());
        user.setEmailVerified(true);
        User savedUser = userRepository.save(user);

        pendingSignupRepository.delete(pending);

        return buildAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password");
        }

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        if (!jwtService.isTokenValid(request.refreshToken())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "Refresh token is invalid or expired");
        }
        var userId = jwtService.extractUserId(request.refreshToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "Refresh token is invalid or expired"));

        return buildAuthResponse(user);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            authTokenRepository.deleteByUser_IdAndType(user.getId(), AuthTokenType.PASSWORD_RESET);
            issueToken(user, AuthTokenType.PASSWORD_RESET, 1, ChronoUnit.HOURS,
                    token -> emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token));
        });
        // Always return success regardless of whether the email exists, so we don't leak account existence.
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        AuthToken authToken = consumeToken(token, AuthTokenType.PASSWORD_RESET);
        User user = authToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void verifyEmail(String token) {
        AuthToken authToken = consumeToken(token, AuthTokenType.EMAIL_VERIFICATION);
        User user = authToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerification(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "Session is invalid"));
        if (user.isEmailVerified()) {
            return;
        }
        authTokenRepository.deleteByUser_IdAndType(user.getId(), AuthTokenType.EMAIL_VERIFICATION);
        issueToken(user, AuthTokenType.EMAIL_VERIFICATION, 24, ChronoUnit.HOURS,
                token -> emailService.sendVerificationEmail(user.getEmail(), user.getName(), token));
    }

    private AuthToken consumeToken(String token, AuthTokenType type) {
        AuthToken authToken = authTokenRepository.findByTokenAndType(token, type)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TOKEN", "This link is invalid or has expired"));
        if (!authToken.isValid()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TOKEN", "This link is invalid or has expired");
        }
        authToken.setUsedAt(Instant.now());
        authTokenRepository.save(authToken);
        return authToken;
    }

    private void issueToken(User user, AuthTokenType type, long ttlAmount, ChronoUnit ttlUnit, java.util.function.Consumer<String> onIssued) {
        AuthToken authToken = new AuthToken();
        authToken.setUser(user);
        authToken.setType(type);
        authToken.setToken(generateToken());
        authToken.setExpiresAt(Instant.now().plus(ttlAmount, ttlUnit));
        authTokenRepository.save(authToken);
        onIssued.accept(authToken.getToken());
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String generateNumericCode() {
        return String.valueOf(100000 + RANDOM.nextInt(900000));
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getId());
        var summary = new AuthResponse.UserSummary(
                user.getId().toString(), user.getName(), user.getUsername(), user.getEmail(), user.isEmailVerified());
        return new AuthResponse(accessToken, refreshToken, summary);
    }
}
