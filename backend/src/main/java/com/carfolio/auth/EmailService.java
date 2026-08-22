package com.carfolio.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final RestClient restClient;
    private final String fromAddress;
    private final String frontendUrl;

    public EmailService(@Value("${carfolio.brevo.api-key}") String brevoApiKey,
                         @Value("${carfolio.mail.from}") String fromAddress,
                         @Value("${carfolio.frontend-url}") String frontendUrl) {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.brevo.com/v3/smtp/email")
                .defaultHeader("api-key", brevoApiKey)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .build();
        this.fromAddress = fromAddress;
        this.frontendUrl = frontendUrl;
    }

    @Async
    public void sendSignupCode(String to, String name, String code) {
        String html = shell("Your CarFolio verification code: " + code, """
                <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#e0531f;">Verify your email</p>
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#17150f;">Hi %s,</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5c5648;">Enter this code to finish creating your CarFolio account.</p>
                <div style="text-align:center;margin:0 0 24px;">
                  <span style="display:inline-block;padding:16px 32px;background-color:#f0ece2;border-radius:10px;font-family:'SF Mono',Consolas,Menlo,monospace;font-size:28px;font-weight:700;letter-spacing:0.4em;color:#17150f;">%s</span>
                </div>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#9c9179;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
                """.formatted(name, code));
        String text = "Hi %s,\n\nYour verification code is: %s\n\nEnter this code to finish creating your CarFolio account. It expires in 15 minutes.\n\n— CarFolio"
                .formatted(name, code);
        send(to, "Your CarFolio verification code", text, html);
    }

    @Async
    public void sendVerificationEmail(String to, String name, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String html = ctaEmail(name, "Verify your email",
                "Verify your email to finish setting up your CarFolio account.",
                "Verify email", link, "This link expires in 24 hours.");
        String text = "Hi %s,\n\nVerify your email to finish setting up your CarFolio account:\n%s\n\nThis link expires in 24 hours.\n\n— CarFolio"
                .formatted(name, link);
        send(to, "Verify your CarFolio email", text, shell("Verify your CarFolio email", html));
    }

    @Async
    public void sendPasswordResetEmail(String to, String name, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String html = ctaEmail(name, "Reset your password",
                "Reset your password using the button below.",
                "Reset password", link, "This link expires in 1 hour. If you didn't request this, you can ignore this email.");
        String text = "Hi %s,\n\nReset your password using the link below:\n%s\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.\n\n— CarFolio"
                .formatted(name, link);
        send(to, "Reset your CarFolio password", text, shell("Reset your CarFolio password", html));
    }

    private String ctaEmail(String name, String heading, String description, String ctaLabel, String ctaUrl, String footnote) {
        return """
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#17150f;">%s</h1>
                <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#5c5648;">Hi %s,</p>
                <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#5c5648;">%s</p>
                <div style="text-align:center;margin:0 0 24px;">
                  <a href="%s" style="display:inline-block;padding:14px 30px;background-color:#e0531f;border-radius:10px;font-size:15px;font-weight:600;color:#fffdfa;text-decoration:none;">%s</a>
                </div>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#9c9179;">%s</p>
                <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#9c9179;word-break:break-all;">Or paste this link into your browser: <a href="%s" style="color:#9c9179;">%s</a></p>
                """.formatted(heading, name, description, ctaUrl, ctaLabel, footnote, ctaUrl, ctaUrl);
    }

    private String shell(String preheader, String bodyHtml) {
        return """
                <!doctype html>
                <html>
                <body style="margin:0;padding:0;background-color:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                  <span style="display:none;max-height:0;overflow:hidden;">%s</span>
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ee;padding:40px 16px;">
                    <tr><td align="center">
                      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%%;">
                        <tr><td style="padding-bottom:28px;text-align:center;">
                          <span style="font-size:20px;font-weight:800;letter-spacing:0.08em;color:#17150f;">CARFOLIO</span>
                        </td></tr>
                        <tr><td style="background-color:#fffdfa;border:1px solid #ddd6c4;border-radius:16px;padding:36px 32px;">
                          %s
                        </td></tr>
                        <tr><td style="padding-top:24px;text-align:center;">
                          <span style="font-size:11px;letter-spacing:0.05em;color:#9c9179;text-transform:uppercase;">Carfolio — for the collection that matters.</span>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(preheader, bodyHtml);
    }

    private void send(String to, String subject, String text, String html) {
        try {
            restClient.post()
                    .body(Map.of(
                            "sender", Map.of("email", fromAddress, "name", "CarFolio"),
                            "to", List.of(Map.of("email", to)),
                            "subject", subject,
                            "htmlContent", html,
                            "textContent", text))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
