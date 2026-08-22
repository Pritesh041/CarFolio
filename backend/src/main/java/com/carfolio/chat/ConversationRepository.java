package com.carfolio.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("select c from Conversation c where " +
            "(c.participantOne.id = :a and c.participantTwo.id = :b) or " +
            "(c.participantOne.id = :b and c.participantTwo.id = :a)")
    Optional<Conversation> findBetween(@Param("a") UUID a, @Param("b") UUID b);

    @Query("select c from Conversation c where c.participantOne.id = :userId or c.participantTwo.id = :userId " +
            "order by c.updatedAt desc")
    List<Conversation> findAllForUser(@Param("userId") UUID userId);
}
