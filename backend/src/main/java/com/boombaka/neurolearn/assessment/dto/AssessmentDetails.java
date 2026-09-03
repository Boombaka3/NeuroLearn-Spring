package com.boombaka.neurolearn.assessment.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** The fixed Brain x AI 101 evaluation fields used by the canonical course UI. */
public record AssessmentDetails(
        @NotNull @Min(1) @Max(5) Integer neuronParts,
        @NotNull @Min(1) @Max(5) Integer neuronSignals,
        @NotNull @Min(1) @Max(5) Integer biologyAiRelationship,
        @NotNull @Min(1) @Max(5) Integer artificialNetworks,
        @NotNull @Min(1) @Max(5) Integer learningFromFeedback,
        @NotNull @Min(1) @Max(5) Integer continuedInterest,
        @Size(max = 2000) String learningGoal,
        @Size(max = 2000) String mostHelpful,
        @Size(max = 2000) String improvementIdeas,
        @Size(max = 2000) String additionalComments) {
}
