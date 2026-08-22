package com.carfolio.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SignupConfirmRequest(@NotBlank @Email String email, @NotBlank String code) {}
