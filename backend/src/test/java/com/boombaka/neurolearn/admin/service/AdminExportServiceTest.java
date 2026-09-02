package com.boombaka.neurolearn.admin.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.boombaka.neurolearn.assessment.domain.AssessmentType;
import com.boombaka.neurolearn.completion.repository.CompletionRecord;
import com.boombaka.neurolearn.completion.repository.CompletionRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminExportServiceTest {

    private static final String HEADER =
            "participant_code,pre_submitted_at,quiz_score,post_submitted_at,complete\r\n";

    @Mock
    private CompletionRepository completionRepository;

    private AdminExportService exportService;

    @BeforeEach
    void setUp() {
        exportService = new AdminExportService(completionRepository);
    }

    @Test
    void emptyDatasetContainsHeaderOnly() {
        when(completionRepository.findAllCompletionRecords(
                AssessmentType.PRE, AssessmentType.POST)).thenReturn(List.of());

        assertThat(csv()).isEqualTo(HEADER);
    }

    @Test
    void exportsVerifiedStoredFieldsAndCompletionState() {
        Instant preAt = Instant.parse("2026-09-01T14:00:00Z");
        Instant postAt = Instant.parse("2026-09-01T16:00:00Z");
        when(completionRepository.findAllCompletionRecords(
                AssessmentType.PRE, AssessmentType.POST))
                .thenReturn(List.of(new CompletionRecord(
                        "LEARNER-501", preAt, preAt.plusSeconds(3600), 4, 5, postAt)));

        assertThat(csv()).isEqualTo(HEADER
                + "LEARNER-501,2026-09-01T14:00:00Z,4,2026-09-01T16:00:00Z,true\r\n");
    }

    @Test
    void escapesCommasAndQuotesUsingCsvRules() {
        when(completionRepository.findAllCompletionRecords(
                AssessmentType.PRE, AssessmentType.POST))
                .thenReturn(List.of(new CompletionRecord(
                        "Cohort, \"A\"", null, null, null, null, null)));

        assertThat(csv()).isEqualTo(HEADER + "\"Cohort, \"\"A\"\"\",,,,false\r\n");
    }

    private String csv() {
        return new String(exportService.exportCsv(), StandardCharsets.UTF_8);
    }
}
