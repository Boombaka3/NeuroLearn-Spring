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
        AssessmentAnswers answers,
        AssessmentDetails details,
        boolean skipped) {

    public static AssessmentSubmissionResponse from(AssessmentSubmission submission) {
        return new AssessmentSubmissionResponse(
                submission.getId(),
                submission.getParticipant().getParticipantCode(),
                submission.getType(),
                submission.getSubmittedAt(),
                new AssessmentAnswers(
                        submission.getAiFamiliarity(),
                        submission.getNeuronUnderstanding(),
                        submission.getAiUnderstanding()),
                detailsFrom(submission),
                submission.isSkipped());
    }

    private static AssessmentDetails detailsFrom(AssessmentSubmission submission) {
        if (submission.getNeuronPartsRating() == null) {
            return null;
        }
        return new AssessmentDetails(
                submission.getNeuronPartsRating(),
                submission.getNeuronSignalsRating(),
                submission.getBiologyAiRelationshipRating(),
                submission.getArtificialNetworksRating(),
                submission.getLearningFromFeedbackRating(),
                submission.getContinuedInterestRating(),
                submission.getLearningGoal(),
                submission.getMostHelpful(),
                submission.getImprovementIdeas(),
                submission.getAdditionalComments());
    }
}
