package com.boombaka.neurolearn.assessment.dto;

import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AssessmentSubmissionRequestValidationTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void createValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        validatorFactory.close();
    }

    @Test
    void acceptsValidSubmission() {
        AssessmentSubmissionRequest request = new AssessmentSubmissionRequest(
                "LEARNER-001", new AssessmentAnswers(3, 4, 5));

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void rejectsInvalidParticipantCode() {
        AssessmentSubmissionRequest request = new AssessmentSubmissionRequest(
                "bad code", new AssessmentAnswers(3, 4, 5));

        Set<ConstraintViolation<AssessmentSubmissionRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("participantCode");
    }

    @Test
    void rejectsAnswerOutsideLikertRange() {
        AssessmentSubmissionRequest request = new AssessmentSubmissionRequest(
                "LEARNER-001", new AssessmentAnswers(0, 4, 6));

        Set<ConstraintViolation<AssessmentSubmissionRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .containsExactlyInAnyOrder("answers.aiFamiliarity", "answers.aiUnderstanding");
    }

    @Test
    void rejectsCanonicalDetailOutsideLikertRange() {
        AssessmentDetails details = new AssessmentDetails(
                0, 2, 3, 4, 5, 6,
                "Learn the basics", null, null, null);
        AssessmentSubmissionRequest request = new AssessmentSubmissionRequest(
                "LEARNER-001", new AssessmentAnswers(3, 4, 5), details);

        Set<ConstraintViolation<AssessmentSubmissionRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .containsExactlyInAnyOrder("details.neuronParts", "details.continuedInterest");
    }
}
