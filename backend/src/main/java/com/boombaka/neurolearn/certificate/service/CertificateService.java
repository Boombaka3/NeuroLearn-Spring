package com.boombaka.neurolearn.certificate.service;

import java.time.LocalDate;
import java.time.ZoneOffset;

import org.springframework.stereotype.Service;

import com.boombaka.neurolearn.certificate.dto.CertificateRequest;
import com.boombaka.neurolearn.completion.dto.CompletionStatusResponse;
import com.boombaka.neurolearn.completion.service.CompletionService;

@Service
public class CertificateService {

    private final CompletionService completionService;
    private final CertificatePdfGenerator pdfGenerator;

    public CertificateService(
            CompletionService completionService,
            CertificatePdfGenerator pdfGenerator) {
        this.completionService = completionService;
        this.pdfGenerator = pdfGenerator;
    }

    public CertificateDocument generate(CertificateRequest request) {
        CompletionStatusResponse completion =
                completionService.requireCompleted(request.participantCode());
        LocalDate completedOn = completion.completedAt().atZone(ZoneOffset.UTC).toLocalDate();
        byte[] pdf = pdfGenerator.generate(
                request.displayName(), completion.participantCode(), completedOn);
        String filename = "neurolearn-certificate-" + completion.participantCode() + ".pdf";
        return new CertificateDocument(pdf, filename);
    }
}
