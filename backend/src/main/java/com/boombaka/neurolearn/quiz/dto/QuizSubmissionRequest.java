package com.boombaka.neurolearn.quiz.dto;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record QuizSubmissionRequest(
        @NotBlank
        @Size(min = 6, max = 32)
        @Pattern(regexp = "^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$",
                message = "must contain only letters, numbers, and single hyphens")
        String participantCode,
        @NotNull
        @Size(min = 10, max = 10, message = "must contain answers for all 10 questions")
        Map<
                @Pattern(regexp = "^q(?:10|[1-9])$", message = "must be a known question id") String,
                @NotBlank @Pattern(regexp = "^[A-D]$", message = "must be A, B, C, or D") String>
                answers) {

    public QuizSubmissionRequest {
        if (answers != null) {
            answers = Map.copyOf(answers);
        }
    }
}
