package com.boombaka.neurolearn.assessment.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "course_participants")
public class CourseParticipant {

    @Id
    private UUID id;

    @Column(name = "participant_code", nullable = false, unique = true, length = 32)
    private String participantCode;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected CourseParticipant() {
    }

    public CourseParticipant(String participantCode, Instant createdAt) {
        this.id = UUID.randomUUID();
        this.participantCode = participantCode;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getParticipantCode() {
        return participantCode;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
