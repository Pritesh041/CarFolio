package com.carfolio.analytics.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ValueHistoryPoint(Instant date, BigDecimal value) {}
