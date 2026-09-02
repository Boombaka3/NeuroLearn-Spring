package com.boombaka.neurolearn.assessment.exception;

public class ParticipantNotFoundException extends RuntimeException {

    public ParticipantNotFoundException(String participantCode) {
        super("Participant " + participantCode + " was not found");
    }
}
