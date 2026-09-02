package com.boombaka.neurolearn.certificate.service;

public record CertificateDocument(byte[] content, String filename) {

    public CertificateDocument {
        content = content.clone();
    }

    @Override
    public byte[] content() {
        return content.clone();
    }
}
