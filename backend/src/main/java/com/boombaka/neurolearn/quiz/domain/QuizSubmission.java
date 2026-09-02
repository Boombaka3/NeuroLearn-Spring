package com.boombaka.neurolearn.quiz.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import com.boombaka.neurolearn.assessment.domain.CourseParticipant;

@Entity
@Table(
        name = "quiz_submissions",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_quiz_submission_participant",
                columnNames = "participant_id"),
        indexes = @Index(
                name = "idx_quiz_submissions_submitted_at",
                columnList = "submitted_at"))
public class QuizSubmission {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private CourseParticipant participant;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizAnswer> answers = new ArrayList<>();

    protected QuizSubmission() {
    }

    public QuizSubmission(
            CourseParticipant participant,
            Instant submittedAt,
            Integer score,
            Integer totalQuestions,
            Map<String, String> selectedAnswers) {
        this.id = UUID.randomUUID();
        this.participant = participant;
        this.submittedAt = submittedAt;
        this.score = score;
        this.totalQuestions = totalQuestions;
        selectedAnswers.entrySet().stream()
                .sorted(Map.Entry.comparingByKey(Comparator.naturalOrder()))
                .map(entry -> new QuizAnswer(this, entry.getKey(), entry.getValue()))
                .forEach(answers::add);
    }

    public UUID getId() {
        return id;
    }

    public CourseParticipant getParticipant() {
        return participant;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public Integer getScore() {
        return score;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public List<QuizAnswer> getAnswers() {
        return List.copyOf(answers);
    }
}
