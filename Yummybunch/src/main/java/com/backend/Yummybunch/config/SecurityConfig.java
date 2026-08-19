package com.backend.Yummybunch.config;

import com.backend.Yummybunch.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    /**
     * Allowed browser origins, comma separated. Hardcoding localhost meant a
     * deployed web app was blocked by CORS, so this is configuration now.
     */
    @Value("${app.cors.origins:http://localhost:3000,http://localhost:3001}")
    private String corsOrigins;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    /**
     * Real password hashing. The previous build used NoOpPasswordEncoder, which
     * stored and compared passwords in plaintext.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ---- Public: this is a marketplace. Anyone may look before signing up.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/restaurants").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/restaurants/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/restaurants/cuisines").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/restaurants/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/restaurants/*/menu").permitAll()
                .requestMatchers("/uploads/**", "/error").permitAll()

                // ---- Owner-only management. Declared before the generic /api/restaurants/**
                //      rules above would otherwise let a GET through.
                .requestMatchers("/api/my-restaurant/**").hasRole("RESTAURANT")

                // ---- Everything else needs a verified account.
                .anyRequest().authenticated()
            )
            // Return 401 rather than a redirect to a login page that does not exist here.
            .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(
                Arrays.stream(corsOrigins.split(","))
                        .map(String::trim)
                        .filter(o -> !o.isEmpty())
                        .toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
