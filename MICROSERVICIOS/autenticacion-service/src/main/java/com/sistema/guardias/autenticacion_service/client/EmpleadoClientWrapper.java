package com.sistema.guardias.autenticacion_service.client;

import com.sistema.guardias.autenticacion_service.dto.NuevoEmpleadoDto;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Wrapper sobre {@link EmpleadoClient} que aplica reintentos automáticos
 * con Resilience4J. Esto es necesario porque las anotaciones de Resilience4J
 * requieren proxies AOP de Spring, que no se generan para interfaces Feign
 * (cuyos proxies los crea OpenFeign).
 *
 * <p>Permite tolerar el delay del discovery-service durante el arranque,
 * donde empleado-service puede no estar aún registrado en Eureka.</p>
 */
@Component
public class EmpleadoClientWrapper {

    private static final Logger log = LoggerFactory.getLogger(EmpleadoClientWrapper.class);

    private final EmpleadoClient empleadoClient;

    public EmpleadoClientWrapper(EmpleadoClient empleadoClient) {
        this.empleadoClient = empleadoClient;
    }

    /**
     * Registra un nuevo empleado delegando al cliente Feign con reintentos.
     * Resilience4J reintenta automáticamente según la configuración de la
     * instancia "empleadoService" en application.properties (backoff exponencial).
     *
     * @param empleado datos del nuevo empleado a registrar
     * @throws feign.FeignException si se agotan todos los reintentos
     */
    @Retry(name = "empleadoService", fallbackMethod = "guardarEmpleadoFallback")
    public void guardarEmpleado(NuevoEmpleadoDto empleado) {
        log.info("Intentando registrar empleado con DNI {} en empleado-service...", empleado.getDni());
        empleadoClient.guardarEmpleado(empleado);
        log.info("Empleado con DNI {} registrado exitosamente.", empleado.getDni());
    }

    /**
     * Fallback invocado cuando se agotan todos los reintentos.
     * Registra el error sin lanzar excepción para no interrumpir el arranque
     * de la aplicación. El usuario deberá registrarse manualmente después.
     *
     * @param empleado datos del empleado que no pudo registrarse
     * @param ex       excepción que causó el fallo final
     */
    @SuppressWarnings("unused") // Invocado por Resilience4J vía reflexión
    private void guardarEmpleadoFallback(NuevoEmpleadoDto empleado, Exception ex) {
        log.error("No se pudo registrar el empleado con DNI {} después de agotar todos los reintentos. " +
                "Causa: {}. El empleado deberá ser registrado manualmente.",
                empleado.getDni(), ex.getMessage());
    }
}
