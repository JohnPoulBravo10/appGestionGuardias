package com.jpbravo.guardia_service.service;

import com.jpbravo.guardia_service.DTO.EmpleadoDTO;
import com.jpbravo.guardia_service.DTO.GuardiaResponseDto;
import com.jpbravo.guardia_service.client.EmpleadoClient;
import com.jpbravo.guardia_service.model.EstadoGuardia;
import com.jpbravo.guardia_service.model.Guardia;
import com.jpbravo.guardia_service.model.Rol;
import com.jpbravo.guardia_service.repository.GuardiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class GuardiaService {

    @Autowired
    private GuardiaRepository repository;

    @Autowired
    private EmpleadoClient empleadoClient;

    public List<Guardia> obtenerTodas() {
        return repository.findAll();
    }

    public List<Guardia> obtenerGuardiasActivas() {
        return repository.findGuardiasActivas();
    }

    public Optional<Guardia> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public Guardia guardarGuardia(Guardia guardia) {
        if (guardia.getEmpleadoId() == null) {
            guardia.setEstado(EstadoGuardia.ABIERTA);
        } else {
            guardia.setEstado(EstadoGuardia.PROXIMA);
        }

        return repository.save(guardia);
    }

    public void eliminarGuardia(Long id) {
        repository.deleteById(id);
    }

    public List<Guardia> obtenerGuardiasEmpleado(
            Long idEmpleado
    ) {
        return repository.findByEmpleadoId(idEmpleado);
    }

    public List<Guardia> obtenerGuardiasPorArea(
            Rol rol
    ) {
        return repository.findByRol(rol);
    }

    public Guardia actualizarGuardia(
            Long id,
            Guardia guardiaActualizada
    ) {
        Guardia guardia = repository
                .findById(id)
                .orElseThrow(
                    () -> new RuntimeException(
                        "Guardia no encontrada"
                    )
                );

        guardia.setFecha(
                guardiaActualizada.getFecha()
        );

        guardia.setHoraInicio(
                guardiaActualizada.getHoraInicio()
        );

        guardia.setHoraFin(
                guardiaActualizada.getHoraFin()
        );

        guardia.setRol(
                guardiaActualizada.getRol()
        );

        guardia.setEmpleadoId(
                guardiaActualizada.getEmpleadoId()
        );

        if (
            guardiaActualizada.getEmpleadoId()
                    == null
        ) {
            guardia.setEstado(
                    EstadoGuardia.ABIERTA
            );
        } else {
            guardia.setEstado(
                    EstadoGuardia.PROXIMA
            );
        }

        return repository.save(guardia);
    }

    
    public List<GuardiaResponseDto>
            obtenerTodasConEmpleado() {

        return convertirGuardiasConEmpleado(
                repository.findAll()
        );
    }

    /**
     * Devuelve las guardias de un área incluyendo
     * el nombre del empleado asignado.
     */
    public List<GuardiaResponseDto>
            obtenerPorAreaConEmpleado(
                    Rol rol
            ) {

        return convertirGuardiasConEmpleado(
                repository.findByRol(rol)
        );
    }

    private List<GuardiaResponseDto>
            convertirGuardiasConEmpleado(
                    List<Guardia> guardias
            ) {

        /*
         * Este mapa evita consultar varias veces
         * al mismo empleado.
         *
         * Ejemplo:
         * si Juan tiene cinco guardias, Feign consulta
         * una sola vez sus datos.
         */
        Map<Long, String> nombresEmpleados =
                new HashMap<>();

        return guardias.stream()
                .map(guardia -> {
                    String empleadoNombre =
                            "Sin asignar";

                    Long empleadoId =
                            guardia.getEmpleadoId();

                    if (empleadoId != null) {
                        empleadoNombre =
                                nombresEmpleados.computeIfAbsent(
                                        empleadoId,
                                        dni -> obtenerNombreEmpleado(
                                                dni
                                        )
                                );
                    }

                    return GuardiaResponseDto
                            .builder()
                            .id(guardia.getId())
                            .fecha(guardia.getFecha())
                            .horaInicio(
                                    guardia.getHoraInicio()
                            )
                            .horaFin(
                                    guardia.getHoraFin()
                            )
                            .empleadoId(
                                    guardia.getEmpleadoId()
                            )
                            .empleadoNombre(
                                    empleadoNombre
                            )
                            .rol(guardia.getRol())
                            .estado(
                                    guardia.getEstado()
                            )
                            .build();
                })
                .toList();
    }

    
    private String obtenerNombreEmpleado(
            Long dni
    ) {
        try {
            EmpleadoDTO empleado =
                    empleadoClient
                            .obtenerEmpleadoPorDni(
                                    dni
                            );

            if (empleado == null) {
                return "Empleado no encontrado";
            }

            String nombre =
                    empleado.getNombre() != null
                            ? empleado.getNombre()
                            : "";

            String apellido =
                    empleado.getApellido() != null
                            ? empleado.getApellido()
                            : "";

            String nombreCompleto =
                    (nombre + " " + apellido)
                            .trim();

            return nombreCompleto.isEmpty()
                    ? "Empleado sin nombre"
                    : nombreCompleto;

        } catch (Exception error) {
            System.err.println(
                    "No se pudo obtener el empleado "
                            + dni
                            + ": "
                            + error.getMessage()
            );

            return "Empleado no encontrado";
        }
    }
}