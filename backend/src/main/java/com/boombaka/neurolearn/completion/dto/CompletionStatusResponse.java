package com.boombaka.neurolearn.completion.dto;

import java.time.Instant;

import com.boombaka.neurolearn.completion.repository.CompletionRecord;

public record CompletionStatusResponse(
        String participantCode,
        boolean preAssessmentSubmitted,
        Instant preSubmittedAt,
        boolean quizSubmitted,
        Instant quizSubmittedAt,
        Integer quizScore,
        Integer quizTotal,
        boolean postAssessmentSubmitted,
        Instant postSubmittedAt,
        boolean complete,
        Instant completedAt) {

    public static CompletionStatusResponse from(CompletionRecord record) {
        return new CompletionStatusResponse(
                record.participantCode(),
                record.preSubmittedAt() != null,
                record.preSubmittedAt(),
                record.quizSubmittedAt() != null,
                record.quizSubmittedAt(),
                record.quizScore(),
                record.quizTotal(),
                record.postSubmittedAt() != null,
                record.postSubmittedAt(),
                record.isComplete(),
                record.completedAt());
    }
}
