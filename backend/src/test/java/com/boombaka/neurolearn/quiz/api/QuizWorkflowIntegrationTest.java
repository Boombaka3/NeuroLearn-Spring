package com.boombaka.neurolearn.quiz.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class QuizWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void scoresValidSubmissionOnServer() throws Exception {
        createParticipant("QUIZ-001");

        submitQuiz("QUIZ-001", perfectAnswers())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.participantCode").value("QUIZ-001"))
                .andExpect(jsonPath("$.score").value(10))
                .andExpect(jsonPath("$.total").value(10))
                .andExpect(jsonPath("$.percentage").value(100.0))
                .andExpect(jsonPath("$.answers").doesNotExist());
    }

    @Test
    void rejectsMissingRequiredAnswer() throws Exception {
        createParticipant("QUIZ-002");

        submitQuiz("QUIZ-002", perfectAnswers().replace(",\"q10\":\"B\"", ""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void rejectsInvalidQuestionId() throws Exception {
        createParticipant("QUIZ-003");

        submitQuiz("QUIZ-003", perfectAnswers().replace("\"q10\":\"B\"", "\"q11\":\"B\""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void rejectsInvalidAnswerOption() throws Exception {
        createParticipant("QUIZ-004");

        submitQuiz("QUIZ-004", perfectAnswers().replace("\"q10\":\"B\"", "\"q10\":\"X\""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void rejectsUnknownParticipant() throws Exception {
        submitQuiz("UNKNOWN-QUIZ", perfectAnswers())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PARTICIPANT_NOT_FOUND"));
    }

    @Test
    void rejectsDuplicateSubmission() throws Exception {
        createParticipant("QUIZ-005");
        submitQuiz("QUIZ-005", perfectAnswers()).andExpect(status().isCreated());

        submitQuiz("QUIZ-005", perfectAnswers())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("QUIZ_ALREADY_SUBMITTED"));
    }

    @Test
    void doesNotAcceptClientSuppliedScore() throws Exception {
        createParticipant("QUIZ-006");
        String body = """
                {
                  "participantCode": "QUIZ-006",
                  "answers": {%s},
                  "score": 10
                }
                """.formatted(perfectAnswers());

        mockMvc.perform(post("/api/quiz/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"));
    }

    private void createParticipant(String participantCode) throws Exception {
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
        mockMvc.perform(post("/api/assessments/pre")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());
    }

    private org.springframework.test.web.servlet.ResultActions submitQuiz(
            String participantCode,
            String answers) throws Exception {
        String body = """
                {
                  "participantCode": "%s",
                  "answers": {%s}
                }
                """.formatted(participantCode, answers);
        return mockMvc.perform(post("/api/quiz/submissions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    private String perfectAnswers() {
        return "\"q1\":\"C\",\"q2\":\"A\",\"q3\":\"D\",\"q4\":\"A\",\"q5\":\"C\","
                + "\"q6\":\"B\",\"q7\":\"D\",\"q8\":\"C\",\"q9\":\"D\",\"q10\":\"B\"";
    }
}
