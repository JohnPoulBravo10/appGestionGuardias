
package com.jpbravo.guardia_service.service;

import com.jpbravo.guardia_service.model.EstadoGuardia;
import com.jpbravo.guardia_service.model.Guardia;
import com.jpbravo.guardia_service.repository.GuardiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class GuardiaService {
    @Autowired
    private GuardiaRepository repository;

    public List<Guardia> obtenerTodas() {
        return repository.findAll();
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

    public List<Guardia> obtenerGuardiasEmpleado(Long idEmpleado) {
        return repository.findByEmpleadoId(idEmpleado);
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

        return repository.save(guardia);
    }
}
