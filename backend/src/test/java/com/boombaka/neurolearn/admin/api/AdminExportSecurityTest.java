package com.boombaka.neurolearn.admin.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
@SpringBootTest(properties = "neurolearn.admin-api-key=test-admin-key")
@AutoConfigureMockMvc
class AdminExportSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void missingCredentialIsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/export.csv"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("ADMIN_CREDENTIAL_REQUIRED"));
    }

    @Test
    void invalidCredentialIsForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/export.csv")
                        .header("X-Admin-Key", "wrong-key"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ADMIN_CREDENTIAL_INVALID"));
    }

    @Test
    void validCredentialDownloadsCsv() throws Exception {
        mockMvc.perform(get("/api/admin/export.csv")
                        .header("X-Admin-Key", "test-admin-key"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/csv"));
    }
}
