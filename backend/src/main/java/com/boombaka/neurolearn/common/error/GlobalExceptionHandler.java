package com.boombaka.neurolearn.common.error;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.boombaka.neurolearn.assessment.exception.AssessmentAlreadySubmittedException;
import com.boombaka.neurolearn.assessment.exception.ParticipantNotFoundException;
import com.boombaka.neurolearn.quiz.exception.InvalidQuizAnswersException;
import com.boombaka.neurolearn.quiz.exception.QuizAlreadySubmittedException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return error(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED",
                "Request validation failed", fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException exception) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        exception.getConstraintViolations().forEach(violation ->
                fieldErrors.put(violation.getPropertyPath().toString(), violation.getMessage()));
        return error(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED",
                "Request validation failed", fieldErrors);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiError> handleMalformedRequest() {
        return error(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST",
                "Request body is missing or malformed", Map.of());
    }

    @ExceptionHandler(AssessmentAlreadySubmittedException.class)
    ResponseEntity<ApiError> handleDuplicate(AssessmentAlreadySubmittedException exception) {
        return error(HttpStatus.CONFLICT, "ASSESSMENT_ALREADY_SUBMITTED",
                exception.getMessage(), Map.of());
    }

    @ExceptionHandler(ParticipantNotFoundException.class)
    ResponseEntity<ApiError> handleParticipantNotFound(ParticipantNotFoundException exception) {
        return error(HttpStatus.NOT_FOUND, "PARTICIPANT_NOT_FOUND",
                exception.getMessage(), Map.of());
    }

    @ExceptionHandler(QuizAlreadySubmittedException.class)
    ResponseEntity<ApiError> handleDuplicateQuiz(QuizAlreadySubmittedException exception) {
        return error(HttpStatus.CONFLICT, "QUIZ_ALREADY_SUBMITTED",
                exception.getMessage(), Map.of());
    }

    @ExceptionHandler(InvalidQuizAnswersException.class)
    ResponseEntity<ApiError> handleInvalidQuizAnswers(InvalidQuizAnswersException exception) {
        return error(HttpStatus.BAD_REQUEST, "INVALID_QUIZ_ANSWERS",
                exception.getMessage(), Map.of());
    }

    private ResponseEntity<ApiError> error(
            HttpStatus status,
            String code,
            String message,
            Map<String, String> fieldErrors) {
        ApiError body = new ApiError(
                Instant.now(), status.value(), code, message, fieldErrors);
        return ResponseEntity.status(status).body(body);
    }
}
