package com.sistema.guardias.autenticacion_service.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

/* Componente encargado de la generación, validación y extracción de datos (claims) de tokens JWT. */
@Component
public class JwtProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private int expiration;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Genera un token inyectando el ID, DNI y roles del usuario en el payload para ser usados por el Gateway.
    public String generateToken(Authentication authentication) {
        UserDetailsImpl usuarioPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        
        return Jwts.builder()
            .setSubject(usuarioPrincipal.getUsername())
            .claim("id", usuarioPrincipal.getId())
            .claim("empleadoDni", usuarioPrincipal.getEmpleadoDni())
            .claim("roles", usuarioPrincipal.getAuthorities())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    // Extrae el nombre de usuario (subject) desencriptando la firma del token.
    public String getUserNameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
