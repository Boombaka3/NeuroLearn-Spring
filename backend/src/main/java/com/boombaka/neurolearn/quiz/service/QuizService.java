package com.boombaka.neurolearn.quiz.service;

import java.time.Clock;
import java.time.Instant;
import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boombaka.neurolearn.assessment.domain.CourseParticipant;
import com.boombaka.neurolearn.assessment.exception.ParticipantNotFoundException;
import com.boombaka.neurolearn.assessment.repository.CourseParticipantRepository;
import com.boombaka.neurolearn.quiz.domain.QuizSubmission;
import com.boombaka.neurolearn.quiz.dto.QuizSubmissionRequest;
import com.boombaka.neurolearn.quiz.dto.QuizSubmissionResponse;
import com.boombaka.neurolearn.quiz.exception.QuizAlreadySubmittedException;
import com.boombaka.neurolearn.quiz.repository.QuizSubmissionRepository;
import com.boombaka.neurolearn.quiz.scoring.QuizScore;
import com.boombaka.neurolearn.quiz.scoring.QuizScoringService;

@Service
public class QuizService {

    private final CourseParticipantRepository participantRepository;
    private final QuizSubmissionRepository submissionRepository;
    private final QuizScoringService scoringService;
    private final Clock clock;

    public QuizService(
            CourseParticipantRepository participantRepository,
            QuizSubmissionRepository submissionRepository,
            QuizScoringService scoringService,
            Clock clock) {
        this.participantRepository = participantRepository;
        this.submissionRepository = submissionRepository;
        this.scoringService = scoringService;
        this.clock = clock;
    }

    @Transactional
    public QuizSubmissionResponse submit(QuizSubmissionRequest request) {
        String participantCode = request.participantCode().trim().toUpperCase(Locale.ROOT);
        CourseParticipant participant = participantRepository.findByParticipantCode(participantCode)
                .orElseThrow(() -> new ParticipantNotFoundException(participantCode));

        if (submissionRepository.existsByParticipantId(participant.getId())) {
            throw new QuizAlreadySubmittedException(participantCode);
        }

        QuizScore score = scoringService.score(request.answers());
        QuizSubmission submission = new QuizSubmission(
                participant,
                Instant.now(clock),
                score.correctAnswers(),
                score.totalQuestions(),
                request.answers());

        try {
            return QuizSubmissionResponse.from(submissionRepository.saveAndFlush(submission));
        } catch (DataIntegrityViolationException exception) {
            throw new QuizAlreadySubmittedException(participantCode, exception);
        }
    }
}
