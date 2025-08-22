-- =============================================
-- ESQUEMA COMPLETO DEL SISTEMA DE TICKETS
-- =============================================

-- Crear la base de datos
CREATE DATABASE ticket_system
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'es_ES.UTF-8'
    LC_CTYPE = 'es_ES.UTF-8'
    TEMPLATE = template0;

\c ticket_system;

-- ========== EXTENSIONES ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== TABLAS MAESTRAS ==========

-- Tabla de departamentos
CREATE TABLE departamentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías de tickets
CREATE TABLE categorias_tickets (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    departamento_id INTEGER REFERENCES departamentos(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de prioridades
CREATE TABLE prioridades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE,
    nivel INTEGER NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT '#3498db',
    tiempo_resolucion_horas INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== TABLAS PRINCIPALES ==========

-- Tabla de usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100),
    telefono VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(10) NOT NULL DEFAULT 'usuario' CHECK (role IN ('usuario', 'tecnico', 'admin')),
    departamento_id INTEGER REFERENCES departamentos(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tickets
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) GENERATED ALWAYS AS ('TICKET-' || LPAD(id::text, 6, '0')) STORED,
    asunto VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    piso INTEGER NOT NULL,
    oficina VARCHAR(50) NOT NULL,
    categoria_id INTEGER REFERENCES categorias_tickets(id) ON DELETE SET NULL,
    prioridad_id INTEGER REFERENCES prioridades(id) ON DELETE SET NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    tecnico_asignado_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    departamento_id INTEGER REFERENCES departamentos(id) ON DELETE SET NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Abierto' 
        CHECK (estado IN ('Abierto', 'En Progreso', 'En Espera', 'Resuelto', 'Cerrado')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    tiempo_estimado_minutos INTEGER,
    tiempo_dedicado_minutos INTEGER DEFAULT 0,
    solucion TEXT,
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario_calificacion TEXT,
    created_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de mensajes del chat
CREATE TABLE mensajes_chat (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de adjuntos
CREATE TABLE adjuntos (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4(),
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamano_bytes BIGINT NOT NULL,
    ruta_archivo TEXT NOT NULL,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    mensaje_id INTEGER REFERENCES mensajes_chat(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de historial de cambios
CREATE TABLE historial_tickets (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(50) NOT NULL,
    campo_modificado VARCHAR(50),
    valor_anterior TEXT,
    nuevo_valor TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    enlace TEXT,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    mensaje_id INTEGER REFERENCES mensajes_chat(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de plantillas de respuestas
CREATE TABLE plantillas_respuestas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    contenido TEXT NOT NULL,
    categoria_id INTEGER REFERENCES categorias_tickets(id) ON DELETE CASCADE,
    departamento_id INTEGER REFERENCES departamentos(id) ON DELETE CASCADE,
    es_publica BOOLEAN DEFAULT FALSE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== ÍNDICES ==========

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_usuarios_departamento ON usuarios(departamento_id);

-- Índices para tickets
CREATE INDEX idx_tickets_codigo ON tickets(codigo);
CREATE INDEX idx_tickets_usuario_id ON tickets(usuario_id);
CREATE INDEX idx_tickets_tecnico_id ON tickets(tecnico_asignado_id);
CREATE INDEX idx_tickets_estado ON tickets(estado);
CREATE INDEX idx_tickets_prioridad ON tickets(prioridad_id);
CREATE INDEX idx_tickets_categoria ON tickets(categoria_id);
CREATE INDEX idx_tickets_departamento ON tickets(departamento_id);
CREATE INDEX idx_tickets_fecha_creacion ON tickets(fecha_creacion);

-- Índices para mensajes de chat
CREATE INDEX idx_mensajes_ticket_id ON mensajes_chat(ticket_id);
CREATE INDEX idx_mensajes_usuario_id ON mensajes_chat(usuario_id);
CREATE INDEX idx_mensajes_created_at ON mensajes_chat(created_at);

-- Índices para adjuntos
CREATE INDEX idx_adjuntos_ticket_id ON adjuntos(ticket_id);
CREATE INDEX idx_adjuntos_mensaje_id ON adjuntos(mensaje_id);

-- Índices para historial
CREATE INDEX idx_historial_ticket_id ON historial_tickets(ticket_id);
CREATE INDEX idx_historial_usuario_id ON historial_tickets(usuario_id);
CREATE INDEX idx_historial_created_at ON historial_tickets(created_at);

-- Índices para notificaciones
CREATE INDEX idx_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_created_at ON notificaciones(created_at);

-- ========== FUNCIONES ==========

-- Función para actualizar automáticamente los campos de fecha
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para generar códigos de ticket
CREATE OR REPLACE FUNCTION generar_codigo_ticket()
RETURNS TRIGGER AS $$
BEGIN
    NEW.codigo := 'TICKET-' || LPAD(NEW.id::text, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar cambios en el historial
CREATE OR REPLACE FUNCTION registrar_cambio_ticket()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Registrar cambios en campos específicos
        IF OLD.estado IS DISTINCT FROM NEW.estado THEN
            INSERT INTO historial_tickets (ticket_id, usuario_id, accion, campo_modificado, valor_anterior, nuevo_valor)
            VALUES (NEW.id, NEW.updated_by, 'CAMBIO_ESTADO', 'estado', OLD.estado, NEW.estado);
        END IF;
        
        IF OLD.tecnico_asignado_id IS DISTINCT FROM NEW.tecnico_asignado_id THEN
            INSERT INTO historial_tickets (ticket_id, usuario_id, accion, campo_modificado, valor_anterior, nuevo_valor)
            VALUES (NEW.id, NEW.updated_by, 'CAMBIO_TECNICO', 'tecnico_asignado_id', 
                   OLD.tecnico_asignado_id::text, NEW.tecnico_asignado_id::text);
        END IF;
        
        IF OLD.prioridad_id IS DISTINCT FROM NEW.prioridad_id THEN
            INSERT INTO historial_tickets (ticket_id, usuario_id, accion, campo_modificado, valor_anterior, nuevo_valor)
            VALUES (NEW.id, NEW.updated_by, 'CAMBIO_PRIORIDAD', 'prioridad_id', 
                   OLD.prioridad_id::text, NEW.prioridad_id::text);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========== TRIGGERS ==========

-- Triggers para actualizar automáticamente los campos de fecha
CREATE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW 
WHEN (OLD.* IS DISTINCT FROM NEW.*)
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mensajes_updated_at
BEFORE UPDATE ON mensajes_chat
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plantillas_updated_at
BEFORE UPDATE ON plantillas_respuestas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para generar códigos de ticket
CREATE TRIGGER generar_codigo_ticket_trigger
BEFORE INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION generar_codigo_ticket();

-- Trigger para registrar cambios en tickets
CREATE TRIGGER registrar_cambios_ticket
AFTER UPDATE ON tickets
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*)
EXECUTE FUNCTION registrar_cambio_ticket();

-- ========== DATOS INICIALES ==========

-- Insertar departamentos
INSERT INTO departamentos (nombre, descripcion) VALUES
('IT', 'Departamento de Tecnologías de la Información'),
('RRHH', 'Recursos Humanos'),
('Finanzas', 'Departamento Financiero'),
('Operaciones', 'Operaciones y Logística'),
('Ventas', 'Departamento Comercial'),
('Soporte', 'Soporte Técnico');

-- Insertar categorías de tickets
INSERT INTO categorias_tickets (nombre, descripcion, departamento_id) VALUES
('Hardware', 'Problemas con equipos de computo', 1),
('Software', 'Problemas con aplicaciones', 1),
('Redes', 'Problemas de conectividad', 1),
('Nómina', 'Consultas sobre pagos', 2),
('Contabilidad', 'Problemas contables', 3),
('Inventario', 'Gestión de activos', 4),
('Ventas', 'Soporte comercial', 5),
('Soporte Remoto', 'Asistencia remota', 6);

-- Insertar prioridades
INSERT INTO prioridades (nombre, nivel, color, tiempo_resolucion_horas) VALUES
('Baja', 1, '#2ecc71', 72),    -- Verde
('Media', 2, '#3498db', 24),   -- Azul
('Alta', 3, '#f39c12', 8),     -- Naranja
('Crítica', 4, '#e74c3c', 4); -- Rojo

-- Insertar usuario administrador por defecto (contraseña: admin123)
INSERT INTO usuarios (username, email, password, nombre_completo, role, is_active)
VALUES (
    'admin', 
    'admin@example.com', 
    crypt('admin123', gen_salt('bf')), 
    'Administrador del Sistema', 
    'admin', 
    true
);

-- Insertar usuario técnico por defecto (contraseña: tecnico123)
INSERT INTO usuarios (username, email, password, nombre_completo, role, departamento_id, is_active)
VALUES (
    'tecnico', 
    'tecnico@example.com', 
    crypt('tecnico123', gen_salt('bf')), 
    'Técnico de Soporte', 
    'tecnico', 
    1, 
    true
);

-- Insertar usuario estándar por defecto (contraseña: usuario123)
INSERT INTO usuarios (username, email, password, nombre_completo, role, departamento_id, is_active)
VALUES (
    'usuario', 
    'usuario@example.com', 
    crypt('usuario123', gen_salt('bf')), 
    'Usuario de Prueba', 
    'usuario', 
    2, 
    true
);

-- Insertar plantillas de respuestas
INSERT INTO plantillas_respuestas (titulo, contenido, categoria_id, departamento_id, es_publica, usuario_id) VALUES
('Reinicio de equipo', 'Estimado/a,\n\nHemos realizado un reinicio de su equipo. Por favor, verifique si el problema persiste.\n\nSaludos cordiales,\nSoporte Técnico', 1, 1, true, 1),
('Actualización de software', 'Estimado/a,\n\nHemos actualizado el software en su equipo. Por favor, reinícielo para aplicar los cambios.\n\nSaludos cordiales,\nSoporte Técnico', 2, 1, true, 1),
('Consulta de nómina', 'Estimado/a,\n\nHemos recibido su consulta sobre nómina. Nuestro equipo de RRHH se pondrá en contacto con usted a la brevedad.\n\nSaludos cordiales,\nRecursos Humanos', 4, 2, true, 1);

-- ========== VISTAS ==========

-- Vista para el dashboard de técnicos
CREATE OR REPLACE VIEW vista_dashboard_tecnico AS
SELECT 
    t.id,
    t.codigo,
    t.asunto,
    t.estado,
    t.fecha_creacion,
    t.fecha_actualizacion,
    p.nombre as prioridad,
    p.nivel as nivel_prioridad,
    c.nombre as categoria,
    d.nombre as departamento,
    u.nombre_completo as solicitante,
    tu.nombre_completo as tecnico_asignado,
    (SELECT COUNT(*) FROM mensajes_chat m WHERE m.ticket_id = t.id AND m.leido = FALSE AND m.usuario_id != t.tecnico_asignado_id) as mensajes_sin_leer
FROM tickets t
JOIN prioridades p ON t.prioridad_id = p.id
LEFT JOIN categorias_tickets c ON t.categoria_id = c.id
LEFT JOIN departamentos d ON t.departamento_id = d.id
LEFT JOIN usuarios u ON t.usuario_id = u.id
LEFT JOIN usuarios tu ON t.tecnico_asignado_id = tu.id;

-- Vista para reportes
CREATE OR REPLACE VIEW vista_reportes_tickets AS
SELECT 
    t.id,
    t.codigo,
    t.asunto,
    t.estado,
    t.fecha_creacion,
    t.fecha_cierre,
    EXTRACT(EPOCH FROM (t.fecha_cierre - t.fecha_creacion))/3600 as horas_resolucion,
    p.nombre as prioridad,
    c.nombre as categoria,
    d.nombre as departamento,
    u.nombre_completo as solicitante,
    tu.nombre_completo as tecnico_asignado,
    t.calificacion
FROM tickets t
JOIN prioridades p ON t.prioridad_id = p.id
LEFT JOIN categorias_tickets c ON t.categoria_id = c.id
LEFT JOIN departamentos d ON t.departamento_id = d.id
LEFT JOIN usuarios u ON t.usuario_id = u.id
LEFT JOIN usuarios tu ON t.tecnico_asignado_id = tu.id;

-- ========== PERMISOS ==========

-- Crear roles
CREATE ROLE ticket_admin WITH LOGIN PASSWORD 'ticket_admin_password' SUPERUSER;
CREATE ROLE ticket_app WITH LOGIN PASSWORD 'ticket_app_password' NOSUPERUSER;

-- Conceder permisos
GRANT ALL PRIVILEGES ON DATABASE ticket_system TO ticket_admin;
GRANT CONNECT ON DATABASE ticket_system TO ticket_app;

-- Conceder permisos en tablas
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ticket_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ticket_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ticket_app;

-- ========== COMENTARIOS ==========

-- Comentarios para documentación
COMMENT ON TABLE usuarios IS 'Almacena la información de los usuarios del sistema';
COMMENT ON COLUMN usuarios.role IS 'Rol del usuario: usuario, tecnico o admin';
COMMENT ON TABLE tickets IS 'Almacena los tickets de soporte';
COMMENT ON COLUMN tickets.estado IS 'Estado actual del ticket: Abierto, En Progreso, En Espera, Resuelto, Cerrado';
COMMENT ON TABLE mensajes_chat IS 'Almacena los mensajes del chat asociados a los tickets';
COMMENT ON TABLE adjuntos IS 'Almacena archivos adjuntos a tickets o mensajes';
COMMENT ON TABLE historial_tickets IS 'Registra todos los cambios realizados en los tickets';
COMMENT ON TABLE notificaciones IS 'Almacena las notificaciones del sistema para los usuarios';
COMMENT ON TABLE plantillas_respuestas IS 'Plantillas predefinidas para respuestas rápidas';

-- Mensaje de finalización
\echo '\n¡Esquema de base de datos creado exitosamente!\n';
\echo 'Credenciales por defecto:';
\echo '  - Admin:     admin@example.com / admin123';
\echo '  - Técnico:   tecnico@example.com / tecnico123';
\echo '  - Usuario:   usuario@example.com / usuario123\n';
\echo 'Ejecuta el siguiente comando para conectarte con el usuario de la aplicación:';
\echo '  psql -U ticket_app -d ticket_system\n';
