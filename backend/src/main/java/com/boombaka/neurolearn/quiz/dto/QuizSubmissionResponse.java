package com.boombaka.neurolearn.quiz.dto;

import java.time.Instant;
import java.util.UUID;

import com.boombaka.neurolearn.quiz.domain.QuizSubmission;

public record QuizSubmissionResponse(
        UUID id,
        String participantCode,
        Instant submittedAt,
        int score,
        int total,
        double percentage) {

    public static QuizSubmissionResponse from(QuizSubmission submission) {
        return new QuizSubmissionResponse(
                submission.getId(),
                submission.getParticipant().getParticipantCode(),
                submission.getSubmittedAt(),
                submission.getScore(),
                submission.getTotalQuestions(),
                submission.getScore() * 100.0 / submission.getTotalQuestions());
    }
}
