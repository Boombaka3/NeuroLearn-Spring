package com.boombaka.neurolearn.completion.service;

import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boombaka.neurolearn.assessment.domain.AssessmentType;
import com.boombaka.neurolearn.assessment.exception.ParticipantNotFoundException;
import com.boombaka.neurolearn.completion.dto.CompletionStatusResponse;
import com.boombaka.neurolearn.completion.exception.CourseNotCompletedException;
import com.boombaka.neurolearn.completion.repository.CompletionRecord;
import com.boombaka.neurolearn.completion.repository.CompletionRepository;

@Service
public class CompletionService {

    private final CompletionRepository completionRepository;

    public CompletionService(CompletionRepository completionRepository) {
        this.completionRepository = completionRepository;
    }

    @Transactional(readOnly = true)
    public CompletionStatusResponse evaluate(String participantCode) {
        return CompletionStatusResponse.from(findRecord(participantCode));
    }

    @Transactional(readOnly = true)
    public CompletionStatusResponse requireCompleted(String participantCode) {
        CompletionStatusResponse status = evaluate(participantCode);
        if (!status.complete()) {
            throw new CourseNotCompletedException(status.participantCode());
        }
        return status;
    }

    private CompletionRecord findRecord(String participantCode) {
        String normalizedCode = participantCode.trim().toUpperCase(Locale.ROOT);
        return completionRepository.findCompletionRecord(
                        normalizedCode, AssessmentType.PRE, AssessmentType.POST)
                .orElseThrow(() -> new ParticipantNotFoundException(normalizedCode));
    }
}
