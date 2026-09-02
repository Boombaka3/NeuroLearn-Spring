package com.boombaka.neurolearn.assessment.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AssessmentAnswers(
        @NotNull @Min(1) @Max(5) Integer aiFamiliarity,
        @NotNull @Min(1) @Max(5) Integer neuronUnderstanding,
        @NotNull @Min(1) @Max(5) Integer aiUnderstanding) {
}
