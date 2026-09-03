package com.boombaka.neurolearn.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("prod")
@SpringBootTest(properties = {
        "SPRING_DATASOURCE_URL=jdbc:h2:mem:production-config;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "DB_USERNAME=sa",
        "DB_PASSWORD=",
        "FRONTEND_ORIGIN=https://learn.example",
        "ADMIN_API_KEY=test-production-key",
        "PORT=9191"
})
class ProductionConfigurationTest {

    @Autowired
    private Environment environment;

    @Test
    void productionProfileUsesHostingEnvironment() {
        assertThat(environment.getProperty("spring.datasource.url"))
                .startsWith("jdbc:h2:mem:production-config");
        assertThat(environment.getProperty("neurolearn.frontend-origin"))
                .isEqualTo("https://learn.example");
        assertThat(environment.getProperty("server.port"))
                .isEqualTo("9191");
    }
}
