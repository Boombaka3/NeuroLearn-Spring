package com.boombaka.neurolearn.admin.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boombaka.neurolearn.assessment.domain.AssessmentType;
import com.boombaka.neurolearn.completion.repository.CompletionRecord;
import com.boombaka.neurolearn.completion.repository.CompletionRepository;

@Service
public class AdminExportService {

    private static final String HEADER =
            "participant_code,pre_submitted_at,quiz_score,post_submitted_at,complete\r\n";

    private final CompletionRepository completionRepository;

    public AdminExportService(CompletionRepository completionRepository) {
        this.completionRepository = completionRepository;
    }

    @Transactional(readOnly = true)
    public byte[] exportCsv() {
        List<CompletionRecord> records = completionRepository.findAllCompletionRecords(
                AssessmentType.PRE, AssessmentType.POST);
        StringBuilder csv = new StringBuilder(HEADER);
        records.forEach(record -> appendRow(csv, record));
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private void appendRow(StringBuilder csv, CompletionRecord record) {
        csv.append(CsvEncoder.field(record.participantCode())).append(',')
                .append(CsvEncoder.field(format(record.preSubmittedAt()))).append(',')
                .append(CsvEncoder.field(record.quizScore())).append(',')
                .append(CsvEncoder.field(format(record.postSubmittedAt()))).append(',')
                .append(record.isComplete())
                .append("\r\n");
    }

    private String format(Instant value) {
        return value == null ? "" : DateTimeFormatter.ISO_INSTANT.format(value);
    }
}
