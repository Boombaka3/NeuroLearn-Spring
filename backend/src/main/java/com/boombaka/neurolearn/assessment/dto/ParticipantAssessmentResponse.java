package com.boombaka.neurolearn.assessment.dto;

import java.time.Instant;
import java.util.List;

public record ParticipantAssessmentResponse(
        String participantCode,
        Instant createdAt,
        List<AssessmentSubmissionResponse> submissions) {

    public ParticipantAssessmentResponse {
        submissions = List.copyOf(submissions);
    }
}
