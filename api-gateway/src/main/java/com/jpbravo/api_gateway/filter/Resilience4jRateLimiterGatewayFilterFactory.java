package com.jpbravo.api_gateway.filter;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/* Fabrica de filtros Gateway para aplicar Rate Limiting usando Resilience4j.
   Limita la cantidad de peticiones que un cliente puede hacer a una ruta específica. */
@Component
@Slf4j
public class Resilience4jRateLimiterGatewayFilterFactory extends AbstractGatewayFilterFactory<Resilience4jRateLimiterGatewayFilterFactory.Config> {

    private final RateLimiterRegistry rateLimiterRegistry;

    public Resilience4jRateLimiterGatewayFilterFactory(RateLimiterRegistry rateLimiterRegistry) {
        super(Config.class);
        this.rateLimiterRegistry = rateLimiterRegistry;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // Obtener la instancia específica del RateLimiter basada en la configuración
            RateLimiter rateLimiter = rateLimiterRegistry.rateLimiter(config.getInstanceName());
            
            // Evaluamos la obtención del permiso usando Mono.defer para integrarlo reactivamente
            return Mono.defer(() -> {
                // Intenta adquirir permiso para ejecutar la petición
                boolean permission = rateLimiter.acquirePermission();
                if (permission) {
                    return chain.filter(exchange); // Permiso concedido, continuar filtro
                } else {
                    // Límite excedido, registrar advertencia y responder con 429 Too Many Requests
                    log.warn("Límite de peticiones excedido (RateLimiter: '{}') para {} {}",
                            config.getInstanceName(),
                            exchange.getRequest().getMethod(),
                            exchange.getRequest().getURI().getPath());
                    exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                    return exchange.getResponse().setComplete();
                }
            });
        };
    }

    // Clase de configuración interna mapeada desde las propiedades de ruta
    public static class Config {
        private String instanceName;

        public String getInstanceName() {
            return instanceName;
        }

        public void setInstanceName(String instanceName) {
            this.instanceName = instanceName;
        }
    }

    // Permite configurar el filtro de manera concisa en application.yml (ej: Resilience4jRateLimiter=authLimiter)
    @Override
    public java.util.List<String> shortcutFieldOrder() {
        return java.util.Collections.singletonList("instanceName");
    }
}
