package com.boombaka.neurolearn.completion.api;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boombaka.neurolearn.completion.dto.CompletionStatusResponse;
import com.boombaka.neurolearn.completion.service.CompletionService;

@Validated
@RestController
@RequestMapping("/api/completion")
public class CompletionController {

    private final CompletionService completionService;

    public CompletionController(CompletionService completionService) {
        this.completionService = completionService;
    }

    @GetMapping("/{participantCode}")
    public CompletionStatusResponse getCompletion(
            @PathVariable
            @Size(min = 6, max = 32)
            @Pattern(regexp = "^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$")
            String participantCode) {
        return completionService.evaluate(participantCode);
    }
}
