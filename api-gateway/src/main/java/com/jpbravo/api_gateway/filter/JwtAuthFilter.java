package com.jpbravo.api_gateway.filter;

import com.jpbravo.api_gateway.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.stream.Collectors;

/* Filtro global que intercepta peticiones entrantes para validar el JWT.
   Sus responsabilidades incluyen:
   - Excluir rutas públicas de la validación.
   - Permitir peticiones OPTIONS (CORS preflight).
   - Rechazar peticiones no autorizadas (401).
   - Sanitizar e inyectar cabeceras internas (X-User-*) con datos del JWT validado 
     para prevenir suplantación de identidad en los microservicios. */
@Component
@Slf4j
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_USER_DNI = "X-User-Dni";
    private static final String HEADER_USER_ROLES = "X-User-Roles";
    private static final String HEADER_USER_NAME = "X-User-Name";

    private final JwtConfig jwtConfig;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public JwtAuthFilter(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Ignorar validación de token si la ruta está configurada como pública
        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        // Permitir peticiones OPTIONS preflight de CORS ya que no incluyen Authorization header
        if (HttpMethod.OPTIONS.equals(request.getMethod())) {
            return chain.filter(exchange);
        }

        // Obtener cabecera Authorization y validar la presencia del prefijo Bearer
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            log.warn("Petición rechazada sin token JWT: {} {}", request.getMethod(), path);
            return onUnauthorized(exchange);
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        try {
            // Validar firma del token y extraer los claims (payload)
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtConfig.getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            /* Mutar la petición original: 
               1. Eliminar cabeceras X-User-* que el cliente pudiera haber inyectado maliciosamente.
               2. Inyectar las cabeceras reales extraídas de los claims del JWT verificado. */
            ServerHttpRequest mutatedRequest = request.mutate()
                    .headers(headers -> {
                        headers.remove(HEADER_USER_ID);
                        headers.remove(HEADER_USER_DNI);
                        headers.remove(HEADER_USER_ROLES);
                        headers.remove(HEADER_USER_NAME);
                    })
                    .header(HEADER_USER_NAME, claims.getSubject())
                    .header(HEADER_USER_ID, extractClaim(claims, "id"))
                    .header(HEADER_USER_DNI, extractClaim(claims, "empleadoDni"))
                    .header(HEADER_USER_ROLES, extractRoles(claims))
                    .build();

            log.debug("Token JWT validado para usuario '{}' en {} {}", claims.getSubject(), request.getMethod(), path);

            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (JwtException e) {
            log.warn("Token JWT inválido para {} {}: {}", request.getMethod(), path, e.getMessage());
            return onUnauthorized(exchange);
        }
    }

    /* Define la prioridad del filtro en la cadena de filtros del Gateway.
       Un valor negativo (-1) asegura que se ejecute tempranamente. */
    @Override
    public int getOrder() {
        return -1;
    }

    // Comprueba si el path solicitado hace match con alguna de las rutas públicas permitidas
    private boolean isPublicPath(String path) {
        return jwtConfig.getPublicPaths().stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    // Devuelve código de estado 401 (No Autorizado) y aborta el procesamiento de la petición
    private Mono<Void> onUnauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    // Obtiene un claim específico evitando devolver null, lo que fallaría al setear la cabecera HTTP
    private String extractClaim(Claims claims, String claimName) {
        Object value = claims.get(claimName);
        return value != null ? value.toString() : "";
    }

    /* Mapea y concatena la lista de roles o authorities extraída del JWT en un solo string separado por comas.
       Soporta el formato de serialización de GrantedAuthority del servicio de autenticación. */
    @SuppressWarnings("unchecked")
    private String extractRoles(Claims claims) {
        Object rolesObj = claims.get("roles");
        if (rolesObj instanceof List<?> rolesList) {
            return rolesList.stream()
                    .map(role -> {
                        if (role instanceof java.util.Map) {
                            Object authority = ((java.util.Map<String, Object>) role).get("authority");
                            return authority != null ? authority.toString() : "";
                        }
                        return role.toString();
                    })
                    .filter(r -> !r.isEmpty())
                    .collect(Collectors.joining(","));
        }
        return "";
    }
}
