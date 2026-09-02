package com.boombaka.neurolearn.certificate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CertificateRequest(
        @NotBlank
        @Size(min = 6, max = 32)
        @Pattern(regexp = "^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$",
                message = "must contain only letters, numbers, and single hyphens")
        String participantCode,
        @NotBlank
        @Size(min = 2, max = 64)
        @Pattern(regexp = "^[A-Za-z][A-Za-z .'-]*$",
                message = "must contain only letters, spaces, periods, apostrophes, and hyphens")
        String displayName) {
}
