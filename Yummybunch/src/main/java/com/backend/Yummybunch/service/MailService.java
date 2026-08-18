package com.backend.Yummybunch.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender sender;
    private final String from;

    public MailService(JavaMailSender sender, @Value("${spring.mail.username:}") String from) {
        this.sender = sender;
        this.from = from;
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

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("Your Yummybunch verification code");
        message.setText("""
                Hi %s,

                Your Yummybunch verification code is:

                    %s

                It expires in 10 minutes. If you did not sign up, you can ignore this email.

                — Yummybunch
                """.formatted(name == null ? "there" : name, code));

        sender.send(message);
        log.info("Verification code sent to {}", to);
    }

    public static class MailNotConfiguredException extends RuntimeException {
        public MailNotConfiguredException(String message) {
            super(message);
        }
    }
}
