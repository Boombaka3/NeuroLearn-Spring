package com.boombaka.neurolearn.admin.api;

import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boombaka.neurolearn.admin.service.AdminExportService;

@RestController
@RequestMapping("/api/admin")
public class AdminExportController {

    private static final MediaType CSV = MediaType.parseMediaType("text/csv;charset=UTF-8");

    private final AdminExportService exportService;

    public AdminExportController(AdminExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping(value = "/export.csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv() {
        return ResponseEntity.ok()
                .contentType(CSV)
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename("neurolearn-completion-export.csv")
                                .build()
                                .toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(exportService.exportCsv());
    }
}
