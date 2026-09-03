package com.boombaka.neurolearn.completion.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.boombaka.neurolearn.assessment.domain.AssessmentType;
import com.boombaka.neurolearn.assessment.domain.CourseParticipant;

public interface CompletionRepository extends Repository<CourseParticipant, UUID> {

    @Query(COMPLETION_SELECT + " WHERE participant.participantCode = :participantCode")
    Optional<CompletionRecord> findCompletionRecord(
            @Param("participantCode") String participantCode,
            @Param("preType") AssessmentType preType,
            @Param("postType") AssessmentType postType);

    @Query(COMPLETION_SELECT + " ORDER BY participant.participantCode")
    List<CompletionRecord> findAllCompletionRecords(
            @Param("preType") AssessmentType preType,
            @Param("postType") AssessmentType postType);

    String COMPLETION_SELECT = """
            SELECT new com.boombaka.neurolearn.completion.repository.CompletionRecord(
                participant.participantCode,
                pre.submittedAt,
                quiz.submittedAt,
                quiz.score,
                quiz.totalQuestions,
                post.submittedAt)
            FROM CourseParticipant participant
            LEFT JOIN AssessmentSubmission pre
                ON pre.participant = participant AND pre.type = :preType AND pre.skipped = false
            LEFT JOIN QuizSubmission quiz
                ON quiz.participant = participant
            LEFT JOIN AssessmentSubmission post
                ON post.participant = participant AND post.type = :postType
            """;
}
