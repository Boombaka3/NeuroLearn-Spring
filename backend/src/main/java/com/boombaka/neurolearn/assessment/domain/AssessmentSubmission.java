package com.boombaka.neurolearn.assessment.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "assessment_submissions",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_participant_assessment_type",
                columnNames = {"participant_id", "assessment_type"}),
        indexes = @Index(name = "idx_assessment_submitted_at", columnList = "submitted_at"))
public class AssessmentSubmission {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private CourseParticipant participant;

    @Enumerated(EnumType.STRING)
    @Column(name = "assessment_type", nullable = false, length = 4)
    private AssessmentType type;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Column(name = "ai_familiarity", nullable = false)
    private Integer aiFamiliarity;

    @Column(name = "neuron_understanding", nullable = false)
    private Integer neuronUnderstanding;

    @Column(name = "ai_understanding", nullable = false)
    private Integer aiUnderstanding;

    protected AssessmentSubmission() {
    }

    public AssessmentSubmission(
            CourseParticipant participant,
            AssessmentType type,
            Instant submittedAt,
            Integer aiFamiliarity,
            Integer neuronUnderstanding,
            Integer aiUnderstanding) {
        this.id = UUID.randomUUID();
        this.participant = participant;
        this.type = type;
        this.submittedAt = submittedAt;
        this.aiFamiliarity = aiFamiliarity;
        this.neuronUnderstanding = neuronUnderstanding;
        this.aiUnderstanding = aiUnderstanding;
    }

    public UUID getId() {
        return id;
    }

    public CourseParticipant getParticipant() {
        return participant;
    }

    public AssessmentType getType() {
        return type;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public Integer getAiFamiliarity() {
        return aiFamiliarity;
    }

    public Integer getNeuronUnderstanding() {
        return neuronUnderstanding;
    }

    public Integer getAiUnderstanding() {
        return aiUnderstanding;
    }
}
