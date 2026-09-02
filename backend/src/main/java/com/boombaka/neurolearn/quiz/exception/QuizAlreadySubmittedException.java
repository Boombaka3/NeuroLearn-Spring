package com.boombaka.neurolearn.quiz.exception;

public class QuizAlreadySubmittedException extends RuntimeException {

    public QuizAlreadySubmittedException(String participantCode) {
        super("Participant " + participantCode + " already submitted the quiz");
    }

    public QuizAlreadySubmittedException(String participantCode, Throwable cause) {
        super("Participant " + participantCode + " already submitted the quiz", cause);
    }
}
