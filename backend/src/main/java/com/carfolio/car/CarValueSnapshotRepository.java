package com.carfolio.car;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface CarValueSnapshotRepository extends JpaRepository<CarValueSnapshot, UUID> {

    List<CarValueSnapshot> findByCarUserIdAndRecordedAtAfterOrderByRecordedAtAsc(UUID userId, Instant after);
}
