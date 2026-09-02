package com.boombaka.neurolearn.assessment.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boombaka.neurolearn.assessment.domain.CourseParticipant;

public interface CourseParticipantRepository extends JpaRepository<CourseParticipant, UUID> {

    Optional<CourseParticipant> findByParticipantCode(String participantCode);
}
