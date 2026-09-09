package com.jpbravo.api_gateway.filter;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class Resilience4jRateLimiterGatewayFilterFactory extends AbstractGatewayFilterFactory<Resilience4jRateLimiterGatewayFilterFactory.Config> {

    private final RateLimiterRegistry rateLimiterRegistry;

    public Resilience4jRateLimiterGatewayFilterFactory(RateLimiterRegistry rateLimiterRegistry) {
        super(Config.class);
        this.rateLimiterRegistry = rateLimiterRegistry;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            RateLimiter rateLimiter = rateLimiterRegistry.rateLimiter(config.getInstanceName());
            
            // Para WebFlux y Reactor, delegamos la verificación del permiso
            return Mono.defer(() -> {
                boolean permission = rateLimiter.acquirePermission();
                if (permission) {
                    return chain.filter(exchange);
                } else {
                    exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                    return exchange.getResponse().setComplete();
                }
            });
        };
    }

    public static class Config {
        private String instanceName;

        public String getInstanceName() {
            return instanceName;
        }

        public void setInstanceName(String instanceName) {
            this.instanceName = instanceName;
        }
    }

    // Configuración para permitir pasar argumentos desde el .properties (ej: =authLimiter)
    @Override
    public java.util.List<String> shortcutFieldOrder() {
        return java.util.Collections.singletonList("instanceName");
    }
}
