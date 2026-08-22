package com.carfolio.collection;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CollectionRepository extends JpaRepository<Collection, UUID> {

    List<Collection> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Collection> findByShareSlugAndUserUsername(String shareSlug, String username);

    boolean existsByShareSlug(String shareSlug);

    List<Collection> findByUserIdAndPublishedTrueOrderByCreatedAtDesc(UUID userId);

    List<Collection> findTop12ByPublishedTrueOrderByUpdatedAtDesc();

    List<Collection> findByUserIdInAndPublishedTrueOrderByUpdatedAtDesc(List<UUID> userIds);
}
