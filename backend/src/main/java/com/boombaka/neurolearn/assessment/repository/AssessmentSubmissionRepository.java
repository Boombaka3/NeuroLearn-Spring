package com.boombaka.neurolearn.assessment.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.boombaka.neurolearn.assessment.domain.AssessmentSubmission;
import com.boombaka.neurolearn.assessment.domain.AssessmentType;

public interface AssessmentSubmissionRepository extends JpaRepository<AssessmentSubmission, UUID> {

    boolean existsByParticipantIdAndType(UUID participantId, AssessmentType type);

    @EntityGraph(attributePaths = "participant")
    List<AssessmentSubmission> findAllByParticipantIdOrderBySubmittedAtAsc(UUID participantId);
}
