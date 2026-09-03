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

    @Column(name = "neuron_parts_rating")
    private Integer neuronPartsRating;

    @Column(name = "neuron_signals_rating")
    private Integer neuronSignalsRating;

    @Column(name = "biology_ai_relationship_rating")
    private Integer biologyAiRelationshipRating;

    @Column(name = "artificial_networks_rating")
    private Integer artificialNetworksRating;

    @Column(name = "learning_from_feedback_rating")
    private Integer learningFromFeedbackRating;

    @Column(name = "continued_interest_rating")
    private Integer continuedInterestRating;

    @Column(name = "learning_goal", length = 2000)
    private String learningGoal;

    @Column(name = "most_helpful", length = 2000)
    private String mostHelpful;

    @Column(name = "improvement_ideas", length = 2000)
    private String improvementIdeas;

    @Column(name = "additional_comments", length = 2000)
    private String additionalComments;

    @Column(name = "skipped", nullable = false)
    private boolean skipped;

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

    public AssessmentSubmission(
            CourseParticipant participant,
            AssessmentType type,
            Instant submittedAt,
            Integer aiFamiliarity,
            Integer neuronUnderstanding,
            Integer aiUnderstanding,
            Integer neuronPartsRating,
            Integer neuronSignalsRating,
            Integer biologyAiRelationshipRating,
            Integer artificialNetworksRating,
            Integer learningFromFeedbackRating,
            Integer continuedInterestRating,
            String learningGoal,
            String mostHelpful,
            String improvementIdeas,
            String additionalComments,
            boolean skipped) {
        this(participant, type, submittedAt, aiFamiliarity, neuronUnderstanding, aiUnderstanding);
        this.neuronPartsRating = neuronPartsRating;
        this.neuronSignalsRating = neuronSignalsRating;
        this.biologyAiRelationshipRating = biologyAiRelationshipRating;
        this.artificialNetworksRating = artificialNetworksRating;
        this.learningFromFeedbackRating = learningFromFeedbackRating;
        this.continuedInterestRating = continuedInterestRating;
        this.learningGoal = learningGoal;
        this.mostHelpful = mostHelpful;
        this.improvementIdeas = improvementIdeas;
        this.additionalComments = additionalComments;
        this.skipped = skipped;
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

    public Integer getNeuronPartsRating() {
        return neuronPartsRating;
    }

    public Integer getNeuronSignalsRating() {
        return neuronSignalsRating;
    }

    public Integer getBiologyAiRelationshipRating() {
        return biologyAiRelationshipRating;
    }

    public Integer getArtificialNetworksRating() {
        return artificialNetworksRating;
    }

    public Integer getLearningFromFeedbackRating() {
        return learningFromFeedbackRating;
    }

    public Integer getContinuedInterestRating() {
        return continuedInterestRating;
    }

    public String getLearningGoal() {
        return learningGoal;
    }

    public String getMostHelpful() {
        return mostHelpful;
    }

    public String getImprovementIdeas() {
        return improvementIdeas;
    }

    public String getAdditionalComments() {
        return additionalComments;
    }

    public boolean isSkipped() {
        return skipped;
    }
}
