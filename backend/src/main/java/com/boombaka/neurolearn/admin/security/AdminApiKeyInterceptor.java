package com.boombaka.neurolearn.admin.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminApiKeyInterceptor implements HandlerInterceptor {

    public static final String ADMIN_KEY_HEADER = "X-Admin-Key";

    private final byte[] configuredKey;

    public AdminApiKeyInterceptor(@Value("${neurolearn.admin-api-key:}") String configuredKey) {
        this.configuredKey = configuredKey.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) {
        if (configuredKey.length == 0) {
            throw AdminAccessException.notConfigured();
        }

        String suppliedKey = request.getHeader(ADMIN_KEY_HEADER);
        if (suppliedKey == null || suppliedKey.isBlank()) {
            throw AdminAccessException.missingCredential();
        }

        byte[] suppliedBytes = suppliedKey.getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(configuredKey, suppliedBytes)) {
            throw AdminAccessException.invalidCredential();
        }
        return true;
    }
}
