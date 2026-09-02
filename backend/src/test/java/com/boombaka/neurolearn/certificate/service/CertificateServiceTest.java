package com.boombaka.neurolearn.certificate.service;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.boombaka.neurolearn.certificate.dto.CertificateRequest;
import com.boombaka.neurolearn.completion.dto.CompletionStatusResponse;
import com.boombaka.neurolearn.completion.exception.CourseNotCompletedException;
import com.boombaka.neurolearn.completion.service.CompletionService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CertificateServiceTest {

    @Mock
    private CompletionService completionService;

    @Mock
    private CertificatePdfGenerator pdfGenerator;

    @Test
    void requiresVerifiedCompletionBeforeGeneratingPdf() {
        CertificateRequest request = new CertificateRequest("LEARNER-402", "Ada Lovelace");
        when(completionService.requireCompleted("LEARNER-402"))
                .thenThrow(new CourseNotCompletedException("LEARNER-402"));
        CertificateService service = new CertificateService(completionService, pdfGenerator);

        assertThatThrownBy(() -> service.generate(request))
                .isInstanceOf(CourseNotCompletedException.class);

        verify(pdfGenerator, never()).generate(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any());
    }

    @Test
    void usesParticipantCodeForSafeFilenameAndDoesNotPersistName() {
        CertificateRequest request = new CertificateRequest(
                "learner-403", "Ada O'Neil-Smith");
        Instant completedAt = Instant.parse("2026-09-02T05:00:00Z");
        CompletionStatusResponse completion = new CompletionStatusResponse(
                "LEARNER-403", true, completedAt, true, completedAt, 5, 5,
                true, completedAt, true, completedAt);
        when(completionService.requireCompleted("learner-403")).thenReturn(completion);
        when(pdfGenerator.generate(
                "Ada O'Neil-Smith", "LEARNER-403", java.time.LocalDate.of(2026, 9, 2)))
                .thenReturn("%PDF".getBytes());
        CertificateService service = new CertificateService(completionService, pdfGenerator);

        CertificateDocument document = service.generate(request);

        assertThat(document.filename())
                .isEqualTo("neurolearn-certificate-LEARNER-403.pdf")
                .doesNotContain("Ada");
    }
}
