package com.carfolio.auth;

import com.carfolio.auth.dto.AuthResponse;
import com.carfolio.auth.dto.ForgotPasswordRequest;
import com.carfolio.auth.dto.LoginRequest;
import com.carfolio.auth.dto.RefreshRequest;
import com.carfolio.auth.dto.ResetPasswordRequest;
import com.carfolio.auth.dto.SignupConfirmRequest;
import com.carfolio.auth.dto.SignupRequest;
import com.carfolio.auth.dto.VerifyEmailRequest;
import com.carfolio.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup-request")
    public ResponseEntity<Void> signupRequest(@Valid @RequestBody SignupRequest request) {
        authService.requestSignup(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/signup-confirm")
    public ResponseEntity<AuthResponse> signupConfirm(@Valid @RequestBody SignupConfirmRequest request) {
        return ResponseEntity.ok(authService.confirmSignup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserSummary> me(@AuthenticationPrincipal UserPrincipal principal) {
        var user = principal.getUser();
        return ResponseEntity.ok(new AuthResponse.UserSummary(
                user.getId().toString(), user.getName(), user.getUsername(), user.getEmail(), user.isEmailVerified()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request.token());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(@AuthenticationPrincipal UserPrincipal principal) {
        authService.resendVerification(principal.getId());
        return ResponseEntity.noContent().build();
    }
}
