package com.boombaka.neurolearn.certificate.service;

import java.io.IOException;
import java.time.LocalDate;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CertificatePdfGeneratorTest {

    private final CertificatePdfGenerator pdfGenerator = new CertificatePdfGenerator();

    @Test
    void generatesReadableOnePagePdfWithSafeEnteredNameAndDate() throws IOException {
        byte[] pdf = pdfGenerator.generate(
                "Ada O'Neil-Smith Jr.", "LEARNER-401", LocalDate.of(2026, 9, 2));

        assertThat(pdf).startsWith("%PDF".getBytes());
        try (PDDocument document = Loader.loadPDF(pdf)) {
            assertThat(document.getNumberOfPages()).isEqualTo(1);
            assertThat(document.getPage(0).getMediaBox().getWidth())
                    .isGreaterThan(document.getPage(0).getMediaBox().getHeight());
            String text = new PDFTextStripper().getText(document);
            assertThat(text)
                    .contains("Certificate of Completion")
                    .contains("Ada O'Neil-Smith Jr.")
                    .contains("Brain \u00d7 AI 101")
                    .contains("Completed September 2, 2026")
                    .contains("Verification code: LEARNER-401");
        }
    }

    @Test
    void generatesReadablePdfForMaximumLengthName() throws IOException {
        String displayName = "W".repeat(64);

        byte[] pdf = pdfGenerator.generate(
                displayName, "LEARNER-402", LocalDate.of(2026, 9, 2));

        try (PDDocument document = Loader.loadPDF(pdf)) {
            assertThat(new PDFTextStripper().getText(document)).contains(displayName);
        }
    }
}
