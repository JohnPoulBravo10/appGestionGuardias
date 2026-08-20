package com.jpbravo.guardia_service.client;

import com.jpbravo.guardia_service.dto.EmpleadoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "empleado-service")
public interface EmpleadoClient {
    @GetMapping("/api/empleados/{dni}")
    EmpleadoDto obtenerEmpleadoPorDni(
            @PathVariable("dni") Long dni
    );
}
