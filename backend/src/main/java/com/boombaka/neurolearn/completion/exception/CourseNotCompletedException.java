package com.boombaka.neurolearn.completion.exception;

public class CourseNotCompletedException extends RuntimeException {

    public CourseNotCompletedException(String participantCode) {
        super("Participant " + participantCode + " has not completed the course");
    }
}
