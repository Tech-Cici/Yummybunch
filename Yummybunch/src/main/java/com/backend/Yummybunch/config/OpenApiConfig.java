package com.backend.Yummybunch.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Describes the API for Swagger UI, and — importantly — registers the bearer
 * token scheme. Without it the "Authorize" button is absent and every protected
 * endpoint returns 401 when tried from the browser.
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER = "bearerAuth";

    @Bean
    public OpenAPI yummybunchOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Yummybunch API")
                        .version("1.0")
                        .description("""
                                Food ordering marketplace.

                                Browsing restaurants and menus is public. Ordering and restaurant
                                management require a JWT.

                                To use protected endpoints here:
                                1. POST /api/auth/login with your email and password.
                                2. Copy the `token` from the response.
                                3. Press Authorize (top right) and paste it — no "Bearer " prefix.
                                """))
                .components(new Components().addSecuritySchemes(BEARER,
                        new SecurityScheme()
                                .name(BEARER)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                // Applied by default; public endpoints simply ignore it.
                .addSecurityItem(new SecurityRequirement().addList(BEARER));
    }
}
