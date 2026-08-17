package com.jpbravo.notification_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notificaciones")
public class Notificacion {
    @Id
    private String id;

    private Long empleadoDni;

    private Long guardiaId;

    private TipoNotificacion tipo;

    private String titulo;

    private String mensaje;

    private boolean leida;

    private LocalDateTime fechaCreacion;

    private String rolDestinatario;
}
