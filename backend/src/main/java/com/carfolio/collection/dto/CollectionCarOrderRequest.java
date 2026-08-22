package com.carfolio.collection.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

public record CollectionCarOrderRequest(@NotEmpty List<UUID> carIds) {}
