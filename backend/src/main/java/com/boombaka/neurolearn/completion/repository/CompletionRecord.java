package com.boombaka.neurolearn.completion.repository;

import java.time.Instant;
import java.util.Objects;
import java.util.stream.Stream;

public record CompletionRecord(
        String participantCode,
        Instant preSubmittedAt,
        Instant quizSubmittedAt,
        Integer quizScore,
        Integer quizTotal,
        Instant postSubmittedAt) {

    public boolean isComplete() {
        return preSubmittedAt != null
                && quizSubmittedAt != null
                && postSubmittedAt != null;
    }

    public Instant completedAt() {
        if (!isComplete()) {
            return null;
        }
        return Stream.of(preSubmittedAt, quizSubmittedAt, postSubmittedAt)
                .filter(Objects::nonNull)
                .max(Instant::compareTo)
                .orElseThrow();
    }
}
