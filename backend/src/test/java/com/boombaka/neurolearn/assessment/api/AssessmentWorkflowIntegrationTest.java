package com.boombaka.neurolearn.assessment.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AssessmentWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void acceptsValidPreSubmission() throws Exception {
        submit("/api/assessments/pre", "LEARNER-001", 3, 4, 5)
                .andExpect(status().isCreated())
                .andExpect(header().string("Location",
                        "/api/assessments/participants/LEARNER-001"))
                .andExpect(jsonPath("$.participantCode").value("LEARNER-001"))
                .andExpect(jsonPath("$.type").value("PRE"))
                .andExpect(jsonPath("$.answers.aiFamiliarity").value(3));
    }

    @Test
    void acceptsValidPostSubmissionForExistingParticipant() throws Exception {
        submit("/api/assessments/pre", "LEARNER-002", 2, 3, 4)
                .andExpect(status().isCreated());

        submit("/api/assessments/post", "learner-002", 4, 5, 5)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.participantCode").value("LEARNER-002"))
                .andExpect(jsonPath("$.type").value("POST"));
    }

    @Test
    void rejectsInvalidParticipantCode() throws Exception {
        submit("/api/assessments/pre", "bad code", 3, 4, 5)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.fieldErrors.participantCode").exists());
    }

    @Test
    void rejectsResponseOutsideLikertRange() throws Exception {
        submit("/api/assessments/pre", "LEARNER-003", 6, 4, 5)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.fieldErrors['answers.aiFamiliarity']").exists());
    }

    @Test
    void rejectsMalformedJsonWithStableError() throws Exception {
        mockMvc.perform(post("/api/assessments/pre")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"participantCode\":\"LEARNER-004\""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"))
                .andExpect(jsonPath("$.fieldErrors").isEmpty());
    }

    @Test
    void participantLookupReturnsMatchedPreAndPostSubmissions() throws Exception {
        submit("/api/assessments/pre", "LEARNER-005", 1, 2, 3)
                .andExpect(status().isCreated());
        submit("/api/assessments/post", "LEARNER-005", 4, 4, 5)
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/assessments/participants/learner-005"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.participantCode").value("LEARNER-005"))
                .andExpect(jsonPath("$.submissions", hasSize(2)))
                .andExpect(jsonPath("$.submissions[0].type").value("PRE"))
                .andExpect(jsonPath("$.submissions[1].type").value("POST"));
    }

    @Test
    void rejectsDuplicateAssessmentType() throws Exception {
        submit("/api/assessments/pre", "LEARNER-006", 3, 4, 5)
                .andExpect(status().isCreated());

        submit("/api/assessments/pre", "LEARNER-006", 4, 4, 5)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ASSESSMENT_ALREADY_SUBMITTED"));
    }

    @Test
    void unknownParticipantReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/assessments/participants/UNKNOWN-001"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PARTICIPANT_NOT_FOUND"));
    }

    private org.springframework.test.web.servlet.ResultActions submit(
            String route,
            String participantCode,
            int aiFamiliarity,
            int neuronUnderstanding,
            int aiUnderstanding) throws Exception {
        String body = """
                {
                  "participantCode": "%s",
                  "answers": {
                    "aiFamiliarity": %d,
                    "neuronUnderstanding": %d,
                    "aiUnderstanding": %d
                  }
                }
                """.formatted(
                participantCode, aiFamiliarity, neuronUnderstanding, aiUnderstanding);

        return mockMvc.perform(post(route)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }
}
