package com.boombaka.neurolearn.completion.service;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.boombaka.neurolearn.assessment.domain.AssessmentType;
import com.boombaka.neurolearn.completion.dto.CompletionStatusResponse;
import com.boombaka.neurolearn.completion.exception.CourseNotCompletedException;
import com.boombaka.neurolearn.completion.repository.CompletionRecord;
import com.boombaka.neurolearn.completion.repository.CompletionRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompletionServiceTest {

    private static final Instant PRE_AT = Instant.parse("2026-09-01T14:00:00Z");
    private static final Instant QUIZ_AT = Instant.parse("2026-09-01T15:00:00Z");
    private static final Instant POST_AT = Instant.parse("2026-09-01T16:00:00Z");

    @Mock
    private CompletionRepository completionRepository;

    private CompletionService completionService;

    @BeforeEach
    void setUp() {
        completionService = new CompletionService(completionRepository);
    }

    @Test
    void reportsParticipantWithOnlyPreAssessmentAsIncomplete() {
        when(completionRepository.findCompletionRecord(
                "LEARNER-301", AssessmentType.PRE, AssessmentType.POST))
                .thenReturn(Optional.of(new CompletionRecord(
                        "LEARNER-301", PRE_AT, null, null, null, null)));

        CompletionStatusResponse status = completionService.evaluate("learner-301");

        assertThat(status.preAssessmentSubmitted()).isTrue();
        assertThat(status.quizSubmitted()).isFalse();
        assertThat(status.postAssessmentSubmitted()).isFalse();
        assertThat(status.complete()).isFalse();
        assertThat(status.completedAt()).isNull();
    }

    @Test
    void reportsParticipantWithAllRequiredRecordsAsComplete() {
        when(completionRepository.findCompletionRecord(
                "LEARNER-302", AssessmentType.PRE, AssessmentType.POST))
                .thenReturn(Optional.of(new CompletionRecord(
                        "LEARNER-302", PRE_AT, QUIZ_AT, 4, 5, POST_AT)));

        CompletionStatusResponse status = completionService.requireCompleted("LEARNER-302");

        assertThat(status.complete()).isTrue();
        assertThat(status.quizScore()).isEqualTo(4);
        assertThat(status.quizTotal()).isEqualTo(5);
        assertThat(status.completedAt()).isEqualTo(POST_AT);
    }

    @Test
    void completedStatusIsRequiredForCertificateConsumers() {
        when(completionRepository.findCompletionRecord(
                "LEARNER-303", AssessmentType.PRE, AssessmentType.POST))
                .thenReturn(Optional.of(new CompletionRecord(
                        "LEARNER-303", PRE_AT, null, null, null, null)));

        assertThatThrownBy(() -> completionService.requireCompleted("LEARNER-303"))
                .isInstanceOf(CourseNotCompletedException.class)
                .hasMessageContaining("LEARNER-303");
    }
}
