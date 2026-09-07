package com.jpbravo.api_gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.List;

import io.jsonwebtoken.security.Keys;

/**
 * Configuración centralizada para la validación de JWT en el Gateway.
 * Lee las propiedades con prefijo "jwt" desde el Config Server.
 */
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {

    private String secret;
    private List<String> publicPaths = List.of("/auth/**");

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public List<String> getPublicPaths() {
        return publicPaths;
    }

    public void setPublicPaths(List<String> publicPaths) {
        this.publicPaths = publicPaths;
    }

    /**
     * Genera la clave de firma HMAC-SHA a partir del secret en Base64.
     * Utiliza el mismo algoritmo que el JwtProvider del autenticacion-service
     * para garantizar la coherencia en la verificación.
     */
    public SecretKey getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
