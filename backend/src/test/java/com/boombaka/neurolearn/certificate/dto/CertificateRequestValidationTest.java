package com.boombaka.neurolearn.certificate.dto;

import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CertificateRequestValidationTest {

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
    void acceptsPunctuationUsedInNames() {
        CertificateRequest request = new CertificateRequest(
                "LEARNER-401", "Ada O'Neil-Smith Jr.");

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void rejectsMarkupAndFilenameCharactersInDisplayName() {
        CertificateRequest request = new CertificateRequest(
                "LEARNER-401", "<script>../Ada</script>");

        Set<ConstraintViolation<CertificateRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("displayName");
    }
}
