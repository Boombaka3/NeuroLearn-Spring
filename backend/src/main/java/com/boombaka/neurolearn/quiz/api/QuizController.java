package com.boombaka.neurolearn.quiz.api;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boombaka.neurolearn.quiz.dto.QuizSubmissionRequest;
import com.boombaka.neurolearn.quiz.dto.QuizSubmissionResponse;
import com.boombaka.neurolearn.quiz.service.QuizService;

@RestController
@RequestMapping("/api/quiz/submissions")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping
    public ResponseEntity<QuizSubmissionResponse> submit(
            @Valid @RequestBody QuizSubmissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.submit(request));
    }
}
