package com.boombaka.neurolearn.assessment.repository;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

import com.boombaka.neurolearn.assessment.domain.AssessmentSubmission;
import com.boombaka.neurolearn.assessment.domain.AssessmentType;
import com.boombaka.neurolearn.assessment.domain.CourseParticipant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AssessmentRepositoryTest {

    private static final Instant NOW = Instant.parse("2026-09-02T05:00:00Z");

    @Autowired
    private CourseParticipantRepository participantRepository;

    @Autowired
    private AssessmentSubmissionRepository submissionRepository;

    @Test
    void persistsStructuredSubmissionAndEnforcesOneTypePerParticipant() {
        CourseParticipant participant = participantRepository.saveAndFlush(
                new CourseParticipant("LEARNER-001", NOW));
        submissionRepository.saveAndFlush(submission(participant, AssessmentType.PRE));

        assertThat(submissionRepository
                .findAllByParticipantIdOrderBySubmittedAtAsc(participant.getId()))
                .singleElement()
                .satisfies(saved -> {
                    assertThat(saved.getType()).isEqualTo(AssessmentType.PRE);
                    assertThat(saved.getAiFamiliarity()).isEqualTo(3);
                    assertThat(saved.getNeuronUnderstanding()).isEqualTo(4);
                    assertThat(saved.getAiUnderstanding()).isEqualTo(5);
                });

        assertThatThrownBy(() -> submissionRepository.saveAndFlush(
                submission(participant, AssessmentType.PRE)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private AssessmentSubmission submission(
            CourseParticipant participant,
            AssessmentType type) {
        return new AssessmentSubmission(participant, type, NOW, 3, 4, 5);
    }
}
