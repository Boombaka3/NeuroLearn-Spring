package com.boombaka.neurolearn.quiz.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.boombaka.neurolearn.quiz.domain.QuizSubmission;

public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, UUID> {

    boolean existsByParticipantId(UUID participantId);

    @EntityGraph(attributePaths = {"participant", "answers"})
    Optional<QuizSubmission> findByParticipantId(UUID participantId);
}
