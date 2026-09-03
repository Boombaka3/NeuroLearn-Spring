package com.boombaka.neurolearn.quiz.scoring;

import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.springframework.stereotype.Service;

import com.boombaka.neurolearn.quiz.exception.InvalidQuizAnswersException;

@Service
public class QuizScoringService {

    private static final Map<String, String> ANSWER_KEY = Map.of(
            "q1", "C",
            "q2", "A",
            "q3", "D",
            "q4", "A",
            "q5", "C",
            "q6", "B",
            "q7", "D",
            "q8", "C",
            "q9", "D",
            "q10", "B");
    private static final Set<String> VALID_OPTIONS = Set.of("A", "B", "C", "D");

    public QuizScore score(Map<String, String> answers) {
        validateAnswers(answers);

        int correctAnswers = (int) ANSWER_KEY.entrySet().stream()
                .filter(entry -> entry.getValue().equals(answers.get(entry.getKey())))
                .count();
        return new QuizScore(correctAnswers, ANSWER_KEY.size());
    }

    private void validateAnswers(Map<String, String> answers) {
        if (answers == null) {
            throw new InvalidQuizAnswersException("Answers are required");
        }

        Set<String> missing = new TreeSet<>(ANSWER_KEY.keySet());
        missing.removeAll(answers.keySet());
        Set<String> unexpected = new TreeSet<>(answers.keySet());
        unexpected.removeAll(ANSWER_KEY.keySet());

        if (!missing.isEmpty() || !unexpected.isEmpty()) {
            throw new InvalidQuizAnswersException(
                    "Quiz must contain exactly q1 through q10; missing="
                            + missing + ", unexpected=" + unexpected);
        }

        if (answers.values().stream().anyMatch(answer -> !VALID_OPTIONS.contains(answer))) {
            throw new InvalidQuizAnswersException("Each answer must be A, B, C, or D");
        }
    }
}
