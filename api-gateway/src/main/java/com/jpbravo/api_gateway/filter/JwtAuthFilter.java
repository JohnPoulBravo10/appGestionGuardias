package com.jpbravo.api_gateway.filter;

import com.jpbravo.api_gateway.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

/**
 * Filtro global del API Gateway que intercepta todas las peticiones entrantes
 * para validar el JWT antes de enrutar hacia los microservicios.
 *
 * <p>Responsabilidades:
 * <ul>
 *   <li>Excluir rutas públicas configurables (ej. /auth/**).</li>
 *   <li>Dejar pasar peticiones OPTIONS (preflight CORS) sin validación.</li>
 *   <li>Rechazar con 401 peticiones sin token o con token inválido/expirado.</li>
 *   <li>Sanitizar cabeceras X-User-* provenientes del cliente externo
 *       para prevenir suplantación de identidad.</li>
 *   <li>Propagar la identidad del usuario autenticado como cabeceras internas
 *       (X-User-Id, X-User-Dni, X-User-Roles, X-User-Name) hacia los
 *       microservicios downstream.</li>
 * </ul>
 */
@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);
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

        // Las rutas públicas no requieren autenticación
        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        // Las peticiones OPTIONS son preflight CORS del navegador y nunca
        // incluyen el header Authorization. Se dejan pasar para que el
        // mecanismo CORS del Gateway las responda correctamente.
        if (HttpMethod.OPTIONS.equals(request.getMethod())) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            log.warn("Petición rechazada sin token JWT: {} {}", request.getMethod(), path);
            return onUnauthorized(exchange);
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtConfig.getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Sanitizar: eliminar cabeceras X-User-* que pudieran venir del cliente externo
            // e inyectar las reales extraídas del JWT verificado.
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

            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (JwtException e) {
            log.warn("Token JWT inválido para {} {}: {}", request.getMethod(), path, e.getMessage());
            return onUnauthorized(exchange);
        }
    }

    /**
     * Prioridad alta (número bajo) para ejecutarse antes que otros filtros del Gateway,
     * asegurando que ninguna petición no autenticada alcance los microservicios.
     */
    @Override
    public int getOrder() {
        return -1;
    }

    /**
     * Verifica si la ruta solicitada coincide con alguna de las rutas públicas
     * configuradas (usa patrones Ant como /auth/**).
     */
    private boolean isPublicPath(String path) {
        return jwtConfig.getPublicPaths().stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    /**
     * Retorna respuesta 401 Unauthorized sin cuerpo.
     * Se completa el response para que el Gateway no continúe procesando.
     */
    private Mono<Void> onUnauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    /**
     * Extrae un claim del JWT de forma segura, retornando cadena vacía si es null.
     * Esto evita que se propaguen headers con valor "null" literal.
     */
    private String extractClaim(Claims claims, String claimName) {
        Object value = claims.get(claimName);
        return value != null ? value.toString() : "";
    }

    /**
     * Extrae los roles del claim "roles" del JWT.
     * El JwtProvider del autenticacion-service almacena los roles como una lista
     * de objetos con campo "authority" (serialización de GrantedAuthority).
     * Se extraen y concatenan con coma para la cabecera.
     */
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
