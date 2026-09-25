package com.backend.Yummybunch.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private static final URI BREVO_URL = URI.create("https://api.brevo.com/v3/smtp/email");

    private final JavaMailSender sender;
    private final String from;
    /**
     * When set, mail goes through Brevo's HTTPS API instead of SMTP. Render's free
     * plan blocks outbound SMTP (25/465/587), so production must use this; local
     * development can leave it blank and keep using Gmail SMTP.
     */
    private final String brevoApiKey;
    private final ObjectMapper json;
    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public MailService(JavaMailSender sender,
                       @Value("${spring.mail.username:}") String from,
                       @Value("${brevo.api-key:}") String brevoApiKey,
                       ObjectMapper json) {
        this.sender = sender;
        this.from = from;
        this.brevoApiKey = brevoApiKey;
        this.json = json;
    }

    /** True when SMTP credentials have actually been configured. */
    public boolean isConfigured() {
        return from != null && !from.isBlank();
    }

    /**
     * Sends the confirmation code.
     *
     * @throws MailNotConfiguredException when no SMTP credentials are present, so the
     *         caller can surface a clear error instead of silently "succeeding".
     */
    public void sendVerificationCode(String to, String name, String code) {
        if (!isConfigured()) {
            throw new MailNotConfiguredException(
                    "Email sending is not configured. Set spring.mail.username and "
                    + "spring.mail.password in application.properties.");
        }

        String subject = "Your Yummybunch verification code";
        String body = """
                Hi %s,

                Your Yummybunch verification code is:

                    %s

                It expires in 10 minutes. If you did not sign up, you can ignore this email.

                — Yummybunch
                """.formatted(name == null ? "there" : name, code);

        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            sendViaBrevo(to, name, subject, body);
        } else {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            sender.send(message);
        }
        log.info("Verification code sent to {}", to);
    }

    /**
     * Throws MailSendException on failure so GlobalExceptionHandler keeps returning
     * the same "could not send" response as the SMTP path.
     */
    private void sendViaBrevo(String to, String name, String subject, String body) {
        try {
            String payload = json.writeValueAsString(Map.of(
                    "sender", Map.of("name", "Yummybunch", "email", from),
                    "to", List.of(Map.of("email", to, "name", name == null ? to : name)),
                    "subject", subject,
                    "textContent", body));

            HttpRequest request = HttpRequest.newBuilder(BREVO_URL)
                    .timeout(Duration.ofSeconds(15))
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                // Brevo explains the problem in the body (bad key, unverified sender, ...).
                throw new MailSendException("Brevo returned " + response.statusCode() + ": " + response.body());
            }
        } catch (MailSendException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new MailSendException("Interrupted while sending via Brevo", e);
        } catch (Exception e) {
            throw new MailSendException("Could not reach Brevo", e);
        }
    }

    public static class MailNotConfiguredException extends RuntimeException {
        public MailNotConfiguredException(String message) {
            super(message);
        }
    }
}
