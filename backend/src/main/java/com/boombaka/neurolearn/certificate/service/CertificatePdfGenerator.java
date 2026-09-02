package com.boombaka.neurolearn.certificate.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Component;

import com.boombaka.neurolearn.certificate.exception.CertificateGenerationException;

@Component
public class CertificatePdfGenerator {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("MMMM d, uuuu", Locale.US);
    private static final float MAX_NAME_WIDTH = 620f;

    public byte[] generate(String displayName, String participantCode, LocalDate completedOn) {
        try (PDDocument document = new PDDocument();
                ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(new PDRectangle(
                    PDRectangle.LETTER.getHeight(), PDRectangle.LETTER.getWidth()));
            document.addPage(page);

            PDFont regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDFont bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDFont italic = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

            drawCertificate(document, page, regular, bold, italic,
                    displayName.trim(), participantCode, completedOn);
            applyMetadata(document, displayName.trim());
            document.save(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new CertificateGenerationException(exception);
        }
    }

    private void drawCertificate(
            PDDocument document,
            PDPage page,
            PDFont regular,
            PDFont bold,
            PDFont italic,
            String displayName,
            String participantCode,
            LocalDate completedOn) throws IOException {
        float width = page.getMediaBox().getWidth();
        float height = page.getMediaBox().getHeight();

        try (PDPageContentStream content = new PDPageContentStream(document, page)) {
            content.setNonStrokingColor(248 / 255f, 250 / 255f, 252 / 255f);
            content.addRect(0, 0, width, height);
            content.fill();

            content.setStrokingColor(15 / 255f, 50 / 255f, 75 / 255f);
            content.setLineWidth(4f);
            content.addRect(24, 24, width - 48, height - 48);
            content.stroke();
            content.setStrokingColor(201 / 255f, 151 / 255f, 48 / 255f);
            content.setLineWidth(1.5f);
            content.addRect(34, 34, width - 68, height - 68);
            content.stroke();

            content.setNonStrokingColor(15 / 255f, 50 / 255f, 75 / 255f);
            drawCenteredText(content, bold, 18, "NEUROLEARN", height - 92, width);
            content.setNonStrokingColor(201 / 255f, 151 / 255f, 48 / 255f);
            drawCenteredText(content, bold, 40, "Certificate of Completion", height - 156, width);

            content.setNonStrokingColor(71 / 255f, 85 / 255f, 105 / 255f);
            drawCenteredText(content, regular, 16, "This certificate is awarded to", height - 213, width);

            float nameSize = fittingFontSize(bold, displayName, 34f, 10f);
            content.setNonStrokingColor(15 / 255f, 50 / 255f, 75 / 255f);
            drawCenteredText(content, bold, nameSize, displayName, height - 267, width);

            content.setStrokingColor(201 / 255f, 151 / 255f, 48 / 255f);
            content.setLineWidth(1f);
            content.moveTo(126, height - 281);
            content.lineTo(width - 126, height - 281);
            content.stroke();

            content.setNonStrokingColor(71 / 255f, 85 / 255f, 105 / 255f);
            drawCenteredText(content, regular, 15,
                    "for completing the Brain \u00d7 AI 101 course", height - 326, width);
            drawCenteredText(content, italic, 13,
                    "Pre-assessment, server-scored quiz, and post-assessment verified",
                    height - 354, width);

            content.setNonStrokingColor(15 / 255f, 50 / 255f, 75 / 255f);
            drawCenteredText(content, bold, 14,
                    "Completed " + DATE_FORMAT.format(completedOn), height - 410, width);

            content.setNonStrokingColor(100 / 255f, 116 / 255f, 139 / 255f);
            drawCenteredText(content, regular, 9,
                    "Verification code: " + participantCode, 58, width);
        }
    }

    private float fittingFontSize(
            PDFont font,
            String text,
            float preferredSize,
            float minimumSize) throws IOException {
        float size = preferredSize;
        while (size > minimumSize && textWidth(font, size, text) > MAX_NAME_WIDTH) {
            size -= 1f;
        }
        return size;
    }

    private void drawCenteredText(
            PDPageContentStream content,
            PDFont font,
            float fontSize,
            String text,
            float y,
            float pageWidth) throws IOException {
        float x = (pageWidth - textWidth(font, fontSize, text)) / 2f;
        content.beginText();
        content.setFont(font, fontSize);
        content.newLineAtOffset(x, y);
        content.showText(text);
        content.endText();
    }

    private float textWidth(PDFont font, float fontSize, String text) throws IOException {
        return font.getStringWidth(text) * fontSize / 1000f;
    }

    private void applyMetadata(PDDocument document, String displayName) {
        PDDocumentInformation information = document.getDocumentInformation();
        information.setTitle("NeuroLearn Course Completion Certificate");
        information.setAuthor("NeuroLearn");
        information.setSubject("Brain x AI 101 completion certificate for " + displayName);
    }
}
