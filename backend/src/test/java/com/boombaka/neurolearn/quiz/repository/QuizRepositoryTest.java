package com.boombaka.neurolearn.quiz.repository;

import java.time.Instant;
import java.util.Map;

import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.boombaka.neurolearn.assessment.domain.CourseParticipant;
import com.boombaka.neurolearn.assessment.repository.CourseParticipantRepository;
import com.boombaka.neurolearn.quiz.domain.QuizSubmission;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class QuizRepositoryTest {

    private static final Instant NOW = Instant.parse("2026-09-02T05:00:00Z");

    @Autowired
    private CourseParticipantRepository participantRepository;

    @Autowired
    private QuizSubmissionRepository submissionRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void persistsServerCalculatedScoreAndNormalizedAnswers() {
        CourseParticipant participant = participantRepository.saveAndFlush(
                new CourseParticipant("LEARNER-201", NOW));
        submissionRepository.saveAndFlush(new QuizSubmission(
                participant,
                NOW,
                3,
                5,
                Map.of("q1", "B", "q2", "A", "q3", "A", "q4", "A", "q5", "A")));
        entityManager.clear();

        assertThat(submissionRepository.findByParticipantId(participant.getId()))
                .get()
                .satisfies(saved -> {
                    assertThat(saved.getScore()).isEqualTo(3);
                    assertThat(saved.getTotalQuestions()).isEqualTo(5);
                    assertThat(saved.getAnswers()).hasSize(5);
                    assertThat(saved.getAnswers())
                            .anySatisfy(answer -> {
                                assertThat(answer.getQuestionId()).isEqualTo("q1");
                                assertThat(answer.getSelectedOption()).isEqualTo("B");
                            });
                });
    }
}
