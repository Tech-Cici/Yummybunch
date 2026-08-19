package com.backend.Yummybunch.web;

import com.backend.Yummybunch.service.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Every error leaves as {"message": "..."} so the frontend has exactly one shape
 * to read, instead of guessing between plain strings and JSON objects.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, String>> handleApi(ApiException e) {
        return ResponseEntity.status(e.getStatus()).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(MailService.MailNotConfiguredException.class)
    public ResponseEntity<Map<String, String>> handleMail(MailService.MailNotConfiguredException e) {
        log.error("Mail not configured: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(org.springframework.mail.MailException.class)
    public ResponseEntity<Map<String, String>> handleMailSend(org.springframework.mail.MailException e) {
        log.error("Failed to send email", e);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", "Could not send the verification email. Check the mail settings and try again."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleOther(Exception e) {
        /*
         * Spring signals ordinary HTTP conditions with exceptions that already
         * carry the right status: an unknown path is NoResourceFoundException
         * (404), a wrong verb is HttpRequestMethodNotSupportedException (405),
         * and so on. All of them implement ErrorResponse.
         *
         * Catching Exception without this check turned every one of them into a
         * 500 — so a simple typo in a URL looked like a server crash.
         */
        if (e instanceof ErrorResponse er) {
            HttpStatus status = HttpStatus.valueOf(er.getStatusCode().value());
            return ResponseEntity.status(status).body(Map.of("message", switch (status) {
                case NOT_FOUND -> "No such endpoint.";
                case METHOD_NOT_ALLOWED -> "That method is not allowed on this endpoint.";
                case UNSUPPORTED_MEDIA_TYPE -> "Unsupported content type.";
                case BAD_REQUEST -> "The request could not be read.";
                default -> status.getReasonPhrase();
            }));
        }

        // Genuinely unexpected: log the detail, tell the client nothing specific.
        log.error("Unhandled error", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Something went wrong. Please try again."));
    }
}
