package com.boombaka.neurolearn.quiz.scoring;

import java.util.LinkedHashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.boombaka.neurolearn.quiz.exception.InvalidQuizAnswersException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class QuizScoringServiceTest {

    private final QuizScoringService scoringService = new QuizScoringService();

    @Test
    void calculatesPerfectScore() {
        assertThat(scoringService.score(perfectAnswers()))
                .isEqualTo(new QuizScore(10, 10));
    }

    @Test
    void calculatesPartiallyCorrectScore() {
        Map<String, String> answers = new LinkedHashMap<>(perfectAnswers());
        answers.put("q3", "A");
        answers.put("q4", "B");
        answers.put("q5", "A");

        assertThat(scoringService.score(answers))
                .isEqualTo(new QuizScore(7, 10));
    }

    @Test
    void calculatesZeroCorrectScore() {
        Map<String, String> answers = Map.of(
                "q1", "A", "q2", "B", "q3", "A", "q4", "B", "q5", "A",
                "q6", "A", "q7", "A", "q8", "A", "q9", "A", "q10", "A");

        assertThat(scoringService.score(answers))
                .isEqualTo(new QuizScore(0, 10));
    }

    @Test
    void rejectsMissingQuestion() {
        Map<String, String> answers = new LinkedHashMap<>(perfectAnswers());
        answers.remove("q10");

        assertThatThrownBy(() -> scoringService.score(answers))
                .isInstanceOf(InvalidQuizAnswersException.class)
                .hasMessageContaining("missing=[q10]");
    }

    @Test
    void rejectsUnexpectedQuestionId() {
        Map<String, String> answers = new LinkedHashMap<>(perfectAnswers());
        answers.remove("q10");
        answers.put("q11", "B");

        assertThatThrownBy(() -> scoringService.score(answers))
                .isInstanceOf(InvalidQuizAnswersException.class)
                .hasMessageContaining("unexpected=[q11]");
    }

    @Test
    void rejectsInvalidAnswerOption() {
        Map<String, String> answers = new LinkedHashMap<>(perfectAnswers());
        answers.put("q10", "X");

        assertThatThrownBy(() -> scoringService.score(answers))
                .isInstanceOf(InvalidQuizAnswersException.class)
                .hasMessageContaining("A, B, C, or D");
    }

    private Map<String, String> perfectAnswers() {
        return Map.of(
                "q1", "C", "q2", "A", "q3", "D", "q4", "A", "q5", "C",
                "q6", "B", "q7", "D", "q8", "C", "q9", "D", "q10", "B");
    }
}
