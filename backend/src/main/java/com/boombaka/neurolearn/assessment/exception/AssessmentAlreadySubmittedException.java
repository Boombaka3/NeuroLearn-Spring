package com.boombaka.neurolearn.assessment.exception;

import com.boombaka.neurolearn.assessment.domain.AssessmentType;

public class AssessmentAlreadySubmittedException extends RuntimeException {

    public AssessmentAlreadySubmittedException(String participantCode, AssessmentType type) {
        super("Participant " + participantCode + " already submitted the " + type + " assessment");
    }

    public AssessmentAlreadySubmittedException(
            String participantCode,
            AssessmentType type,
            Throwable cause) {
        super("Participant " + participantCode + " already submitted the " + type + " assessment", cause);
    }
}
