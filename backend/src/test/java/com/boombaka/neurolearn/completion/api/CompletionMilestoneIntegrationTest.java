package com.boombaka.neurolearn.completion.api;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "neurolearn.admin-api-key=test-admin-key")
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CompletionMilestoneIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void preQuizPostFlowBecomesCompleteAndGeneratesCertificate() throws Exception {
        submitAssessment("/api/assessments/pre", "FLOW-001");

        mockMvc.perform(get("/api/completion/FLOW-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preAssessmentSubmitted").value(true))
                .andExpect(jsonPath("$.quizSubmitted").value(false))
                .andExpect(jsonPath("$.postAssessmentSubmitted").value(false))
                .andExpect(jsonPath("$.complete").value(false));

        submitQuiz("FLOW-001");
        submitAssessment("/api/assessments/post", "FLOW-001");

        mockMvc.perform(get("/api/completion/flow-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.participantCode").value("FLOW-001"))
                .andExpect(jsonPath("$.quizScore").value(10))
                .andExpect(jsonPath("$.complete").value(true))
                .andExpect(jsonPath("$.completedAt").exists());

        MvcResult certificate = mockMvc.perform(post("/api/certificates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "participantCode": "FLOW-001",
                                  "displayName": "Ada O'Neil-Smith"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition",
                        "attachment; filename=\"neurolearn-certificate-FLOW-001.pdf\""))
                .andReturn();
        assertThat(certificate.getResponse().getContentAsByteArray())
                .startsWith("%PDF".getBytes(StandardCharsets.US_ASCII));

        mockMvc.perform(get("/api/admin/export.csv")
                        .header("X-Admin-Key", "test-admin-key"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/csv"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString(
                        "participant_code,pre_submitted_at,quiz_score,post_submitted_at,complete")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("FLOW-001")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString(",10,")));
    }

    @Test
    void incompleteParticipantCannotGenerateCertificate() throws Exception {
        submitAssessment("/api/assessments/pre", "FLOW-002");

        mockMvc.perform(post("/api/certificates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "participantCode": "FLOW-002",
                                  "displayName": "Ada Lovelace"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("COURSE_NOT_COMPLETED"));
    }

    @Test
    void skippedPreAssessmentDoesNotSatisfyCompletionRule() throws Exception {
        String skippedPre = """
                {
                  "participantCode": "FLOW-SKIP",
                  "answers": {
                    "aiFamiliarity": 3,
                    "neuronUnderstanding": 3,
                    "aiUnderstanding": 3
                  },
                  "skipped": true
                }
                """;
        mockMvc.perform(post("/api/assessments/pre")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(skippedPre))
                .andExpect(status().isCreated());
        submitQuiz("FLOW-SKIP");
        submitAssessment("/api/assessments/post", "FLOW-SKIP");

        mockMvc.perform(get("/api/completion/FLOW-SKIP"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preAssessmentSubmitted").value(false))
                .andExpect(jsonPath("$.quizSubmitted").value(true))
                .andExpect(jsonPath("$.postAssessmentSubmitted").value(true))
                .andExpect(jsonPath("$.complete").value(false));
    }

    @Test
    void unsafeCertificateNameReturnsValidationError() throws Exception {
        mockMvc.perform(post("/api/certificates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "participantCode": "FLOW-003",
                                  "displayName": "<script>alert('x')</script>"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.fieldErrors.displayName").exists());
    }

    @Test
    void unknownParticipantCompletionReturnsStableNotFoundError() throws Exception {
        mockMvc.perform(get("/api/completion/UNKNOWN-001"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PARTICIPANT_NOT_FOUND"));
    }

    @Test
    void invalidCompletionParticipantCodeReturnsValidationError() throws Exception {
        mockMvc.perform(get("/api/completion/bad_code"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    private void submitAssessment(String route, String participantCode) throws Exception {
        String body = """
                {
                  "participantCode": "%s",
                  "answers": {
                    "aiFamiliarity": 3,
                    "neuronUnderstanding": 3,
                    "aiUnderstanding": 3
                  }
                }
                """.formatted(participantCode);
        mockMvc.perform(post(route)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());
    }

    private void submitQuiz(String participantCode) throws Exception {
        String body = """
                {
                  "participantCode": "%s",
                  "answers": {
                    "q1": "C",
                    "q2": "A",
                    "q3": "D",
                    "q4": "A",
                    "q5": "C",
                    "q6": "B",
                    "q7": "D",
                    "q8": "C",
                    "q9": "D",
                    "q10": "B"
                  }
                }
                """.formatted(participantCode);
        mockMvc.perform(post("/api/quiz/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());
    }
}
