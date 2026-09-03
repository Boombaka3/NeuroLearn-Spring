package com.boombaka.neurolearn.quiz.service;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.boombaka.neurolearn.assessment.domain.CourseParticipant;
import com.boombaka.neurolearn.assessment.exception.ParticipantNotFoundException;
import com.boombaka.neurolearn.assessment.repository.CourseParticipantRepository;
import com.boombaka.neurolearn.quiz.domain.QuizSubmission;
import com.boombaka.neurolearn.quiz.dto.QuizSubmissionRequest;
import com.boombaka.neurolearn.quiz.dto.QuizSubmissionResponse;
import com.boombaka.neurolearn.quiz.exception.QuizAlreadySubmittedException;
import com.boombaka.neurolearn.quiz.repository.QuizSubmissionRepository;
import com.boombaka.neurolearn.quiz.scoring.QuizScoringService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    private static final Instant NOW = Instant.parse("2026-09-02T05:00:00Z");

    @Mock
    private CourseParticipantRepository participantRepository;

    @Mock
    private QuizSubmissionRepository submissionRepository;

    private QuizService quizService;

    @BeforeEach
    void setUp() {
        quizService = new QuizService(
                participantRepository,
                submissionRepository,
                new QuizScoringService(),
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void scoresAndPersistsSubmissionForExistingParticipant() {
        CourseParticipant participant = new CourseParticipant("LEARNER-101", NOW);
        when(participantRepository.findByParticipantCode("LEARNER-101"))
                .thenReturn(Optional.of(participant));
        when(submissionRepository.existsByParticipantId(participant.getId())).thenReturn(false);
        when(submissionRepository.saveAndFlush(any(QuizSubmission.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        QuizSubmissionResponse response = quizService.submit(request("learner-101"));

        assertThat(response.participantCode()).isEqualTo("LEARNER-101");
        assertThat(response.submittedAt()).isEqualTo(NOW);
        assertThat(response.score()).isEqualTo(10);
        assertThat(response.total()).isEqualTo(10);
        assertThat(response.percentage()).isEqualTo(100.0);
        verify(submissionRepository).saveAndFlush(any(QuizSubmission.class));
    }

    @Test
    void rejectsUnknownParticipantWithoutPersisting() {
        when(participantRepository.findByParticipantCode("UNKNOWN-101"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> quizService.submit(request("unknown-101")))
                .isInstanceOf(ParticipantNotFoundException.class);

        verify(submissionRepository, never()).saveAndFlush(any());
    }

    @Test
    void rejectsDuplicateSubmissionBeforeScoringOrPersisting() {
        CourseParticipant participant = new CourseParticipant("LEARNER-102", NOW);
        when(participantRepository.findByParticipantCode("LEARNER-102"))
                .thenReturn(Optional.of(participant));
        when(submissionRepository.existsByParticipantId(participant.getId())).thenReturn(true);

        assertThatThrownBy(() -> quizService.submit(request("LEARNER-102")))
                .isInstanceOf(QuizAlreadySubmittedException.class);

        verify(submissionRepository, never()).saveAndFlush(any());
    }

    private QuizSubmissionRequest request(String participantCode) {
        return new QuizSubmissionRequest(participantCode, Map.of(
                "q1", "C", "q2", "A", "q3", "D", "q4", "A", "q5", "C",
                "q6", "B", "q7", "D", "q8", "C", "q9", "D", "q10", "B"));
    }
}
