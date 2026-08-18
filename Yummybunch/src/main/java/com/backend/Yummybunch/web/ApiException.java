package com.backend.Yummybunch.web;

import org.springframework.http.HttpStatus;

/** A failure with a message that is safe and useful to show the end user. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
