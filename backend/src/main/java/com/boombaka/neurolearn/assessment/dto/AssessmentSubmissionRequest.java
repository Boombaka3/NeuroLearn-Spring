package com.boombaka.neurolearn.assessment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AssessmentSubmissionRequest(
        @NotBlank
        @Size(min = 6, max = 32)
        @Pattern(regexp = "^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$",
                message = "must contain only letters, numbers, and single hyphens")
        String participantCode,
        @NotNull @Valid AssessmentAnswers answers) {
}
