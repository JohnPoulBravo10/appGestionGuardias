package com.jpbravo.solicitudes_service.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Configuración del {@link RestClient} con soporte de service discovery.
 * La anotación {@link LoadBalanced} permite resolver nombres de servicio
 * registrados en Eureka (por ejemplo, {@code http://guardia-service})
 * a instancias concretas con balanceo de carga.
 */
@Configuration
public class RestClientConfig {

    /**
     * Builder de RestClient con balanceo de carga habilitado.
     * Al inyectar este builder en los clientes HTTP, las URLs con nombres
     * de servicio Eureka se resuelven automáticamente.
     */
    @Bean
    @LoadBalanced
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }
}
