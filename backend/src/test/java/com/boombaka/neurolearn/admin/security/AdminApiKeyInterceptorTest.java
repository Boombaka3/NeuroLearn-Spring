package com.boombaka.neurolearn.admin.security;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class AdminApiKeyInterceptorTest {

    @Test
    void unconfiguredKeyFailsClosed() {
        AdminApiKeyInterceptor interceptor = new AdminApiKeyInterceptor("");

        assertThatThrownBy(() -> interceptor.preHandle(
                new MockHttpServletRequest(), new MockHttpServletResponse(), new Object()))
                .isInstanceOf(AdminAccessException.class)
                .satisfies(error -> {
                    AdminAccessException accessError = (AdminAccessException) error;
                    org.assertj.core.api.Assertions.assertThat(accessError.getStatus())
                            .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
                    org.assertj.core.api.Assertions.assertThat(accessError.getCode())
                            .isEqualTo("ADMIN_ACCESS_NOT_CONFIGURED");
                });
    }
}
