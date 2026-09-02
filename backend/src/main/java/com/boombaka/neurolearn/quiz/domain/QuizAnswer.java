package com.boombaka.neurolearn.quiz.domain;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "quiz_answers",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_quiz_answer_question",
                columnNames = {"submission_id", "question_id"}))
public class QuizAnswer {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private QuizSubmission submission;

    @Column(name = "question_id", nullable = false, length = 16)
    private String questionId;

    @Column(name = "selected_option", nullable = false, length = 1)
    private String selectedOption;

    protected QuizAnswer() {
    }

    QuizAnswer(QuizSubmission submission, String questionId, String selectedOption) {
        this.id = UUID.randomUUID();
        this.submission = submission;
        this.questionId = questionId;
        this.selectedOption = selectedOption;
    }

    public UUID getId() {
        return id;
    }

    public String getQuestionId() {
        return questionId;
    }

    public String getSelectedOption() {
        return selectedOption;
    }
}
