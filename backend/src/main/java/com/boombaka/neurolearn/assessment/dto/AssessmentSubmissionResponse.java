package com.boombaka.neurolearn.assessment.dto;

import java.time.Instant;
import java.util.UUID;

import com.boombaka.neurolearn.assessment.domain.AssessmentSubmission;
import com.boombaka.neurolearn.assessment.domain.AssessmentType;

public record AssessmentSubmissionResponse(
        UUID id,
        String participantCode,
        AssessmentType type,
        Instant submittedAt,
        AssessmentAnswers answers) {

    public static AssessmentSubmissionResponse from(AssessmentSubmission submission) {
        return new AssessmentSubmissionResponse(
                submission.getId(),
                submission.getParticipant().getParticipantCode(),
                submission.getType(),
                submission.getSubmittedAt(),
                new AssessmentAnswers(
                        submission.getAiFamiliarity(),
                        submission.getNeuronUnderstanding(),
                        submission.getAiUnderstanding()));
    }
}
