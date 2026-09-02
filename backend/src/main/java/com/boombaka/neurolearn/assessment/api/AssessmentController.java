package com.boombaka.neurolearn.assessment.api;

import java.net.URI;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boombaka.neurolearn.assessment.dto.AssessmentSubmissionRequest;
import com.boombaka.neurolearn.assessment.dto.AssessmentSubmissionResponse;
import com.boombaka.neurolearn.assessment.dto.ParticipantAssessmentResponse;
import com.boombaka.neurolearn.assessment.service.AssessmentService;

@Validated
@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping("/pre")
    public ResponseEntity<AssessmentSubmissionResponse> submitPre(
            @Valid @RequestBody AssessmentSubmissionRequest request) {
        return created(assessmentService.submitPre(request));
    }

    @PostMapping("/post")
    public ResponseEntity<AssessmentSubmissionResponse> submitPost(
            @Valid @RequestBody AssessmentSubmissionRequest request) {
        return created(assessmentService.submitPost(request));
    }

    @GetMapping("/participants/{participantCode}")
    public ParticipantAssessmentResponse getParticipantAssessments(
            @PathVariable
            @Size(min = 6, max = 32)
            @Pattern(regexp = "^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$")
            String participantCode) {
        return assessmentService.getParticipantAssessments(participantCode);
    }

    private ResponseEntity<AssessmentSubmissionResponse> created(
            AssessmentSubmissionResponse response) {
        URI participantUri = URI.create(
                "/api/assessments/participants/" + response.participantCode());
        return ResponseEntity.created(participantUri).body(response);
    }
}
