package com.boombaka.neurolearn.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.boombaka.neurolearn.admin.security.AdminApiKeyInterceptor;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {

    private final String frontendOrigin;
    private final AdminApiKeyInterceptor adminApiKeyInterceptor;

    public WebConfiguration(
            @Value("${neurolearn.frontend-origin}") String frontendOrigin,
            AdminApiKeyInterceptor adminApiKeyInterceptor) {
        this.frontendOrigin = frontendOrigin;
        this.adminApiKeyInterceptor = adminApiKeyInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminApiKeyInterceptor)
                .addPathPatterns("/api/admin/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(frontendOrigin)
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("Content-Type", "X-Admin-Key")
                .maxAge(3600);
    }
}
