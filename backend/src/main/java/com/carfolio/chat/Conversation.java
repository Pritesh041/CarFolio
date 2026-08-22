package com.carfolio.chat;

import com.carfolio.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "conversations")
@Getter
@Setter
public class Conversation {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_one_id", nullable = false)
    private User participantOne;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_two_id", nullable = false)
    private User participantTwo;

    @Column(name = "participant_one_last_read_at")
    private Instant participantOneLastReadAt;

    @Column(name = "participant_two_last_read_at")
    private Instant participantTwoLastReadAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public User otherParticipant(UUID userId) {
        return participantOne.getId().equals(userId) ? participantTwo : participantOne;
    }

    public boolean hasParticipant(UUID userId) {
        return participantOne.getId().equals(userId) || participantTwo.getId().equals(userId);
    }

    public Instant lastReadAtFor(UUID userId) {
        return participantOne.getId().equals(userId) ? participantOneLastReadAt : participantTwoLastReadAt;
    }

    public void markReadFor(UUID userId, Instant at) {
        if (participantOne.getId().equals(userId)) {
            participantOneLastReadAt = at;
        } else {
            participantTwoLastReadAt = at;
        }
    }
}
