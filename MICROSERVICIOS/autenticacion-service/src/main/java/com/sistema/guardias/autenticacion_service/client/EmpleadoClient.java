package com.sistema.guardias.autenticacion_service.client;

import com.sistema.guardias.autenticacion_service.dto.NuevoEmpleadoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Cliente Feign para comunicación con empleado-service vía Eureka.
 * Las llamadas a este cliente se protegen con reintentos en
 * {@link EmpleadoClientWrapper} para tolerar el delay del discovery-service.
 */
@FeignClient(name = "empleado-service", path = "/api/empleados")
public interface EmpleadoClient {

    /**
     * Registra un nuevo empleado en el servicio de empleados.
     *
     * @param empleado datos del nuevo empleado a registrar
     */
    @PostMapping
    void guardarEmpleado(@RequestBody NuevoEmpleadoDto empleado);
}
