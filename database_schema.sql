-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(15),
    departamento VARCHAR(100),
    puesto VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tipos de servicio
CREATE TABLE IF NOT EXISTS tipos_servicio (
    id_tipo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Tabla de solicitudes de servicio
CREATE TABLE IF NOT EXISTS solicitudes (
    id_solicitud SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario),
    id_tipo INTEGER REFERENCES tipos_servicio(id_tipo),
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    prioridad VARCHAR(20) CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Urgente')),
    estado VARCHAR(30) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'Resuelto', 'Cancelado')),
    equipo VARCHAR(100),
    ubicacion VARCHAR(200),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_atencion TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    notas_tecnico TEXT,
    tecnico_asignado VARCHAR(100)
);

-- Insertar tipos de servicio predefinidos
INSERT INTO tipos_servicio (nombre, descripcion) VALUES
('Soporte Técnico', 'Problemas generales con equipo de cómputo'),
('Instalación de Software', 'Instalación o actualización de programas'),
('Mantenimiento Preventivo', 'Revisión y limpieza de equipos'),
('Configuración de Red', 'Problemas de conectividad o configuración de red'),
('Reparación de Hardware', 'Fallas físicas en componentes del equipo'),
('Respaldo de Información', 'Solicitud de respaldo de datos'),
('Creación de Usuario', 'Alta de usuarios en sistemas'),
('Otro', 'Otros servicios no especificados');

-- Índices para mejorar rendimiento
CREATE INDEX idx_solicitudes_usuario ON solicitudes(id_usuario);
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX idx_solicitudes_fecha ON solicitudes(fecha_solicitud);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Vista para consultas comunes
CREATE VIEW vista_solicitudes_completas AS
SELECT 
    s.id_solicitud,
    s.titulo,
    s.descripcion,
    s.prioridad,
    s.estado,
    s.equipo,
    s.ubicacion,
    s.fecha_solicitud,
    s.fecha_resolucion,
    u.nombre || ' ' || u.apellido_paterno || ' ' || COALESCE(u.apellido_materno, '') AS nombre_completo,
    u.email,
    u.telefono,
    u.departamento,
    ts.nombre AS tipo_servicio,
    s.tecnico_asignado
FROM solicitudes s
JOIN usuarios u ON s.id_usuario = u.id_usuario
JOIN tipos_servicio ts ON s.id_tipo = ts.id_tipo
ORDER BY s.fecha_solicitud DESC;