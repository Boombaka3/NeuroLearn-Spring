package com.boombaka.neurolearn.assessment.service;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boombaka.neurolearn.assessment.domain.AssessmentSubmission;
import com.boombaka.neurolearn.assessment.domain.AssessmentType;
import com.boombaka.neurolearn.assessment.domain.CourseParticipant;
import com.boombaka.neurolearn.assessment.dto.AssessmentAnswers;
import com.boombaka.neurolearn.assessment.dto.AssessmentSubmissionRequest;
import com.boombaka.neurolearn.assessment.dto.AssessmentSubmissionResponse;
import com.boombaka.neurolearn.assessment.dto.ParticipantAssessmentResponse;
import com.boombaka.neurolearn.assessment.exception.AssessmentAlreadySubmittedException;
import com.boombaka.neurolearn.assessment.exception.ParticipantNotFoundException;
import com.boombaka.neurolearn.assessment.repository.AssessmentSubmissionRepository;
import com.boombaka.neurolearn.assessment.repository.CourseParticipantRepository;

@Service
public class AssessmentService {

    private final CourseParticipantRepository participantRepository;
    private final AssessmentSubmissionRepository submissionRepository;
    private final Clock clock;

    public AssessmentService(
            CourseParticipantRepository participantRepository,
            AssessmentSubmissionRepository submissionRepository,
            Clock clock) {
        this.participantRepository = participantRepository;
        this.submissionRepository = submissionRepository;
        this.clock = clock;
    }

    @Transactional
    public AssessmentSubmissionResponse submitPre(AssessmentSubmissionRequest request) {
        return submit(request, AssessmentType.PRE);
    }

    @Transactional
    public AssessmentSubmissionResponse submitPost(AssessmentSubmissionRequest request) {
        return submit(request, AssessmentType.POST);
    }

    @Transactional(readOnly = true)
    public ParticipantAssessmentResponse getParticipantAssessments(String participantCode) {
        String normalizedCode = normalize(participantCode);
        CourseParticipant participant = participantRepository.findByParticipantCode(normalizedCode)
                .orElseThrow(() -> new ParticipantNotFoundException(normalizedCode));

        List<AssessmentSubmissionResponse> submissions = submissionRepository
                .findAllByParticipantIdOrderBySubmittedAtAsc(participant.getId())
                .stream()
                .map(AssessmentSubmissionResponse::from)
                .toList();

        return new ParticipantAssessmentResponse(
                participant.getParticipantCode(), participant.getCreatedAt(), submissions);
    }

    private AssessmentSubmissionResponse submit(
            AssessmentSubmissionRequest request,
            AssessmentType type) {
        String participantCode = normalize(request.participantCode());
        CourseParticipant participant = resolveParticipant(participantCode, type);

        if (submissionRepository.existsByParticipantIdAndType(participant.getId(), type)) {
            throw new AssessmentAlreadySubmittedException(participantCode, type);
        }

        AssessmentAnswers answers = request.answers();
        AssessmentSubmission submission = new AssessmentSubmission(
                participant,
                type,
                Instant.now(clock),
                answers.aiFamiliarity(),
                answers.neuronUnderstanding(),
                answers.aiUnderstanding());

        try {
            return AssessmentSubmissionResponse.from(submissionRepository.saveAndFlush(submission));
        } catch (DataIntegrityViolationException exception) {
            throw new AssessmentAlreadySubmittedException(participantCode, type, exception);
        }
    }

    private CourseParticipant resolveParticipant(String participantCode, AssessmentType type) {
        return participantRepository.findByParticipantCode(participantCode)
                .orElseGet(() -> {
                    if (type == AssessmentType.POST) {
                        throw new ParticipantNotFoundException(participantCode);
                    }
                    return participantRepository.save(
                            new CourseParticipant(participantCode, Instant.now(clock)));
                });
    }

    private String normalize(String participantCode) {
        return participantCode.trim().toUpperCase(Locale.ROOT);
    }
}
