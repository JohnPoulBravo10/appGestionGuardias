package com.jpbravo.api_gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.List;

import io.jsonwebtoken.security.Keys;

/* Configuración centralizada para la validación de JWT. 
   Carga las propiedades "jwt.secret" y "jwt.public-paths" desde el Config Server. */
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

    /* Decodifica el secreto en Base64 y genera la clave criptográfica HMAC-SHA.
       Debe coincidir con la usada en autenticacion-service para validar firmas correctamente. */
    public SecretKey getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
