package com.jpbravo.guardia_service.service;

import com.jpbravo.guardia_service.dto.GuardiaResponseDto;
import com.jpbravo.guardia_service.event.GuardiaEvent;
import com.jpbravo.guardia_service.event.TipoGuardiaEvent;
import com.jpbravo.guardia_service.model.EmpleadoCache;
import com.jpbravo.guardia_service.model.EstadoGuardia;
import com.jpbravo.guardia_service.model.Guardia;
import com.jpbravo.guardia_service.model.Rol;
import com.jpbravo.guardia_service.producer.GuardiaEventProducer;
import com.jpbravo.guardia_service.repository.EmpleadoCacheRepository;
import com.jpbravo.guardia_service.repository.GuardiaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class GuardiaService {

    @Autowired
    private GuardiaRepository repository;

    @Autowired
    private EmpleadoCacheRepository empleadoCacheRepository;

    @Autowired
    private GuardiaEventProducer guardiaEventProducer;

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

        Guardia guardiaGuardada = repository.save(guardia);

        if (guardiaGuardada.getEmpleadoId() != null) {

            GuardiaEvent evento = GuardiaEvent.builder()
                    .tipoEvento(TipoGuardiaEvent.GUARDIA_ASIGNADA)
                    .guardiaId(guardiaGuardada.getId())
                    .empleadoId(guardiaGuardada.getEmpleadoId())
                    .fecha(guardiaGuardada.getFecha())
                    .horaInicio(guardiaGuardada.getHoraInicio())
                    .horaFin(guardiaGuardada.getHoraFin())
                    .rol(guardiaGuardada.getRol())
                    .fechaEvento(LocalDateTime.now())
                    .build();

            guardiaEventProducer.publicarEvento(evento);
        }

        return guardiaGuardada;
    }

    public void eliminarGuardia(Long id) {

        Guardia guardia = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guardia no encontrada"));

        repository.deleteById(id);

        if (guardia.getEmpleadoId() != null) {

            GuardiaEvent evento = GuardiaEvent.builder()
                    .tipoEvento(TipoGuardiaEvent.GUARDIA_ELIMINADA)
                    .guardiaId(guardia.getId())
                    .empleadoId(guardia.getEmpleadoId())
                    .fecha(guardia.getFecha())
                    .horaInicio(guardia.getHoraInicio())
                    .horaFin(guardia.getHoraFin())
                    .rol(guardia.getRol())
                    .fechaEvento(LocalDateTime.now())
                    .build();

            guardiaEventProducer.publicarEvento(evento);
        }
    }

    public List<Guardia> obtenerGuardiasEmpleado(Long idEmpleado) {
        return repository.findByEmpleadoId(idEmpleado);
    }

    public List<Guardia> obtenerGuardiasPorArea(Rol rol) {
        return repository.findByRol(rol);
    }

    /*
     * Método agregado para solicitudes-service.
     * Permite cambiar solamente el empleado de una guardia.
     */
    public Guardia reasignarEmpleado(Long guardiaId, Long empleadoId) {

        Guardia guardia = repository.findById(guardiaId)
                .orElseThrow(() -> new RuntimeException(
                        "Guardia no encontrada con id: " + guardiaId
                ));

        guardia.setEmpleadoId(empleadoId);

        if (empleadoId == null) {
            guardia.setEstado(EstadoGuardia.ABIERTA);
        } else {
            guardia.setEstado(EstadoGuardia.PROXIMA);
        }

        return repository.save(guardia);
    }

    public Guardia actualizarGuardia(Long id, Guardia guardiaActualizada) {

        Guardia guardia = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guardia no encontrada"));

        guardia.setFecha(guardiaActualizada.getFecha());
        guardia.setHoraInicio(guardiaActualizada.getHoraInicio());
        guardia.setHoraFin(guardiaActualizada.getHoraFin());
        guardia.setRol(guardiaActualizada.getRol());
        guardia.setEmpleadoId(guardiaActualizada.getEmpleadoId());

        if (guardiaActualizada.getEmpleadoId() == null) {
            guardia.setEstado(EstadoGuardia.ABIERTA);
        } else {
            guardia.setEstado(EstadoGuardia.PROXIMA);
        }

        Guardia guardiaGuardada = repository.save(guardia);

        if (guardiaGuardada.getEmpleadoId() != null) {

            GuardiaEvent evento = GuardiaEvent.builder()
                    .tipoEvento(TipoGuardiaEvent.GUARDIA_MODIFICADA)
                    .guardiaId(guardiaGuardada.getId())
                    .empleadoId(guardiaGuardada.getEmpleadoId())
                    .fecha(guardiaGuardada.getFecha())
                    .horaInicio(guardiaGuardada.getHoraInicio())
                    .horaFin(guardiaGuardada.getHoraFin())
                    .rol(guardiaGuardada.getRol())
                    .fechaEvento(LocalDateTime.now())
                    .build();

            guardiaEventProducer.publicarEvento(evento);
        }

        return guardiaGuardada;
    }

    public List<GuardiaResponseDto> obtenerTodasConEmpleado() {
        return convertirGuardiasConEmpleado(repository.findAll());
    }

    public List<GuardiaResponseDto> obtenerPorAreaConEmpleado(Rol rol) {
        return convertirGuardiasConEmpleado(repository.findByRol(rol));
    }

    private List<GuardiaResponseDto> convertirGuardiasConEmpleado(List<Guardia> guardias) {

        Map<Long, String> nombresEmpleados = new HashMap<>();

        return guardias.stream()
                .map(guardia -> {

                    String empleadoNombre = "Sin asignar";
                    Long empleadoId = guardia.getEmpleadoId();

                    if (empleadoId != null) {
                        empleadoNombre = nombresEmpleados.computeIfAbsent(
                                empleadoId,
                                this::obtenerNombreEmpleado
                        );
                    }

                    return GuardiaResponseDto.builder()
                            .id(guardia.getId())
                            .fecha(guardia.getFecha())
                            .horaInicio(guardia.getHoraInicio())
                            .horaFin(guardia.getHoraFin())
                            .empleadoId(guardia.getEmpleadoId())
                            .empleadoNombre(empleadoNombre)
                            .rol(guardia.getRol())
                            .estado(guardia.getEstado())
                            .build();
                })
                .toList();
    }

    /**
     * Resuelve el nombre completo de un empleado consultando la caché local.
     * Reemplaza la antigua llamada HTTP síncrona a empleado-service,
     * eliminando el acoplamiento temporal entre servicios.
     *
     * @param dni DNI del empleado a buscar en la caché
     * @return nombre completo o mensaje de fallback si no se encuentra
     */
    private String obtenerNombreEmpleado(Long dni) {

        Optional<EmpleadoCache> cacheOpt = empleadoCacheRepository.findById(dni);

        if (cacheOpt.isEmpty()) {
            return "Empleado no encontrado";
        }

        EmpleadoCache cache = cacheOpt.get();

        String nombre = cache.getNombre() != null
                ? cache.getNombre()
                : "";

        String apellido = cache.getApellido() != null
                ? cache.getApellido()
                : "";

        String nombreCompleto = (nombre + " " + apellido).trim();

        return nombreCompleto.isEmpty()
                ? "Empleado sin nombre"
                : nombreCompleto;
    }
}