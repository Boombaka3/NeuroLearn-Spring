package com.boombaka.neurolearn.certificate.exception;

public class CertificateGenerationException extends RuntimeException {

    public CertificateGenerationException(Throwable cause) {
        super("The certificate PDF could not be generated", cause);
    }
}
