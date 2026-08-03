package com.jpbravo.guardia_service.client;


import com.jpbravo.guardia_service.DTO.EmpleadoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "empleado-service")
public interface EmpleadoClient {
    @GetMapping("/api/empleados/{dni}")
    EmpleadoDTO obtenerEmpleadoPorDni(
            @PathVariable("dni") Long dni
    );
}
