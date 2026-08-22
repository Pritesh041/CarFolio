package com.carfolio.analytics.dto;

import java.math.BigDecimal;

public record BreakdownItem(String label, long count, BigDecimal percent) {}
