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
                .isEqualTo(new QuizScore(5, 5));
    }

    @Test
    void calculatesPartiallyCorrectScore() {
        Map<String, String> answers = new LinkedHashMap<>(perfectAnswers());
        answers.put("q3", "A");
        answers.put("q4", "A");
        answers.put("q5", "A");

        assertThat(scoringService.score(answers))
                .isEqualTo(new QuizScore(2, 5));
    }

    @Test
    void calculatesZeroCorrectScore() {
        Map<String, String> answers = Map.of(
                "q1", "A", "q2", "B", "q3", "A", "q4", "A", "q5", "A");

        assertThat(scoringService.score(answers))
                .isEqualTo(new QuizScore(0, 5));
    }

    @Test
    void rejectsMissingQuestion() {
        Map<String, String> answers = new LinkedHashMap<>(perfectAnswers());
        answers.remove("q5");

        assertThatThrownBy(() -> scoringService.score(answers))
                .isInstanceOf(InvalidQuizAnswersException.class)
                .hasMessageContaining("missing=[q5]");
    }

    @Test
    void rejectsUnexpectedQuestionId() {
        Map<String, String> answers = new LinkedHashMap<>(perfectAnswers());
        answers.remove("q5");
        answers.put("q6", "B");

        assertThatThrownBy(() -> scoringService.score(answers))
                .isInstanceOf(InvalidQuizAnswersException.class)
                .hasMessageContaining("unexpected=[q6]");
    }

    @Test
    void rejectsInvalidAnswerOption() {
        Map<String, String> answers = new LinkedHashMap<>(perfectAnswers());
        answers.put("q5", "X");

        assertThatThrownBy(() -> scoringService.score(answers))
                .isInstanceOf(InvalidQuizAnswersException.class)
                .hasMessageContaining("A, B, C, or D");
    }

    private Map<String, String> perfectAnswers() {
        return Map.of("q1", "B", "q2", "A", "q3", "C", "q4", "D", "q5", "B");
    }
}
