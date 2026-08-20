package com.jpbravo.solicitudes_service.client;

import com.jpbravo.solicitudes_service.exception.GuardiaCommunicationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

// Cambiar a FeignClient en algun momento

/**
 * Cliente HTTP para la comunicación con el guardia-service.
 * Utiliza {@link RestClient} con balanceo de carga (Eureka)
 * para invocar los endpoints REST del servicio de guardias.
 *
 * Responsabilidad única: encapsular las llamadas HTTP al guardia-service
 * y traducir los errores de red a excepciones de dominio.
 */
@Component
public class GuardiaServiceClient {

    private static final Logger log = LoggerFactory.getLogger(GuardiaServiceClient.class);

    /** URL base resuelta por el load balancer a través de Eureka. */
    private static final String GUARDIA_SERVICE_BASE_URL = "http://guardia-service";

    private final RestClient restClient;

    public GuardiaServiceClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl(GUARDIA_SERVICE_BASE_URL)
                .build();
    }

    /**
     * Reasigna el empleado de una guardia en el guardia-service.
     * Si {@code empleadoId} es {@code null}, la guardia queda sin empleado asignado.
     *
     * @param guardiaId  identificador de la guardia a reasignar
     * @param empleadoId DNI del nuevo empleado, o {@code null} para liberar la guardia
     * @throws GuardiaCommunicationException si la comunicación falla
     */
    public void reasignarEmpleado(Long guardiaId, Long empleadoId) {
        log.info("Reasignando guardia {} al empleado {}", guardiaId, empleadoId);

        try {
            // HashMap permite valores null, a diferencia de Map.of()
            Map<String, Object> body = new HashMap<>();
            body.put("empleadoId", empleadoId);

            restClient.patch()
                    .uri("/api/guardias/{id}/reasignar", guardiaId)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Guardia {} reasignada exitosamente", guardiaId);
        } catch (Exception ex) {
            log.error("Error al reasignar guardia {}: {}", guardiaId, ex.getMessage());
            throw new GuardiaCommunicationException(guardiaId, ex);
        }
    }
}
