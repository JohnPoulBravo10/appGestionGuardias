package com.jpbravo.guardia_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class GuardiaStatusScheduler {

    private final GuardiaStatusProcessor processor;

    @Scheduled(cron = "0 * * * * *")
    public void checkAndUpdateGuardiaStatus() {
        log.info("Ejecutando proceso automático de actualización de estados de guardias...");

        try {
            processor.procesarActualizacionDeEstados().join();
        } catch (Exception e) {
            log.error("Error (Timeout o Retry Excedido) al procesar actualización de estados de guardias: {}", e.getMessage());
        }
    }
}
