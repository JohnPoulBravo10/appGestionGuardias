package com.jpbravo.guardia_service.event;

// Tipos de eventos relacionados con guardias
public enum TipoGuardiaEvent {

    // Se emite cuando se asigna una nueva guardia
    GUARDIA_ASIGNADA,
    
    // Se emite cuando se modifica una guardia
    GUARDIA_MODIFICADA,
    
    // Se emite cuando se elimina una guardia
    GUARDIA_ELIMINADA,
    
    // Se emite cuando una guardia es comenzada
    GUARDIA_COMENZADA,
    
    // Se emite cuando una guardia es terminada
    GUARDIA_TERMINADA
}