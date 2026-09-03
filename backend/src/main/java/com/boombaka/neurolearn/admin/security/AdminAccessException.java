package com.boombaka.neurolearn.admin.security;

import org.springframework.http.HttpStatus;

public class AdminAccessException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    private AdminAccessException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public static AdminAccessException missingCredential() {
        return new AdminAccessException(
                HttpStatus.UNAUTHORIZED,
                "ADMIN_CREDENTIAL_REQUIRED",
                "An administrative credential is required");
    }

    public static AdminAccessException invalidCredential() {
        return new AdminAccessException(
                HttpStatus.FORBIDDEN,
                "ADMIN_CREDENTIAL_INVALID",
                "The administrative credential is invalid");
    }

    public static AdminAccessException notConfigured() {
        return new AdminAccessException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "ADMIN_ACCESS_NOT_CONFIGURED",
                "Administrative access is not configured");
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }
}
