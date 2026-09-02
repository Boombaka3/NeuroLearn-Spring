package com.boombaka.neurolearn.assessment.service;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.boombaka.neurolearn.assessment.domain.AssessmentSubmission;
import com.boombaka.neurolearn.assessment.domain.AssessmentType;
import com.boombaka.neurolearn.assessment.domain.CourseParticipant;
import com.boombaka.neurolearn.assessment.dto.AssessmentAnswers;
import com.boombaka.neurolearn.assessment.dto.AssessmentSubmissionRequest;
import com.boombaka.neurolearn.assessment.dto.AssessmentSubmissionResponse;
import com.boombaka.neurolearn.assessment.exception.AssessmentAlreadySubmittedException;
import com.boombaka.neurolearn.assessment.exception.ParticipantNotFoundException;
import com.boombaka.neurolearn.assessment.repository.AssessmentSubmissionRepository;
import com.boombaka.neurolearn.assessment.repository.CourseParticipantRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssessmentServiceTest {

    private static final Instant NOW = Instant.parse("2026-09-02T05:00:00Z");

    @Mock
    private CourseParticipantRepository participantRepository;

    @Mock
    private AssessmentSubmissionRepository submissionRepository;

    private AssessmentService assessmentService;

    @BeforeEach
    void setUp() {
        assessmentService = new AssessmentService(
                participantRepository,
                submissionRepository,
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void validPreSubmissionCreatesAnonymousParticipantAndPersistsAnswers() {
        AssessmentSubmissionRequest request = request("learner-001");
        when(participantRepository.findByParticipantCode("LEARNER-001"))
                .thenReturn(Optional.empty());
        when(participantRepository.save(any(CourseParticipant.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(submissionRepository.saveAndFlush(any(AssessmentSubmission.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AssessmentSubmissionResponse response = assessmentService.submitPre(request);

        assertThat(response.participantCode()).isEqualTo("LEARNER-001");
        assertThat(response.type()).isEqualTo(AssessmentType.PRE);
        assertThat(response.submittedAt()).isEqualTo(NOW);
        assertThat(response.answers()).isEqualTo(new AssessmentAnswers(3, 4, 5));
        verify(participantRepository).save(any(CourseParticipant.class));
        verify(submissionRepository).saveAndFlush(any(AssessmentSubmission.class));
    }

    @Test
    void postSubmissionRequiresExistingParticipant() {
        when(participantRepository.findByParticipantCode("UNKNOWN-001"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> assessmentService.submitPost(request("unknown-001")))
                .isInstanceOf(ParticipantNotFoundException.class);

        verify(participantRepository, never()).save(any());
        verify(submissionRepository, never()).saveAndFlush(any());
    }

    @Test
    void duplicateAssessmentTypeIsRejectedBeforeInsert() {
        CourseParticipant participant = new CourseParticipant("LEARNER-001", NOW);
        when(participantRepository.findByParticipantCode("LEARNER-001"))
                .thenReturn(Optional.of(participant));
        when(submissionRepository.existsByParticipantIdAndType(
                participant.getId(), AssessmentType.PRE)).thenReturn(true);

        assertThatThrownBy(() -> assessmentService.submitPre(request("LEARNER-001")))
                .isInstanceOf(AssessmentAlreadySubmittedException.class)
                .hasMessageContaining("PRE");

        verify(submissionRepository, never()).saveAndFlush(any());
    }

    private AssessmentSubmissionRequest request(String participantCode) {
        return new AssessmentSubmissionRequest(
                participantCode, new AssessmentAnswers(3, 4, 5));
    }
}
