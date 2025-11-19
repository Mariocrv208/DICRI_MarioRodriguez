-- 0_schema_modificado.sql
CREATE DATABASE dicri_db;
GO
USE dicri_db;
GO

CREATE SCHEMA dicri;
GO

-- Tabla de usuarios
CREATE TABLE dicri.Usuario (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    correo NVARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol NVARCHAR(50) NOT NULL, -- ejemplo: "tecnico", "coordinador"
    creado_en DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- Tabla de expedientes
CREATE TABLE dicri.Expediente (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo_unico NVARCHAR(50) NOT NULL UNIQUE,
    descripcion NVARCHAR(500) NOT NULL,
    fecha_registro DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    tecnico_id INT NOT NULL,
    estado NVARCHAR(20) NOT NULL DEFAULT 'EN_REGISTRO', -- EN_REGISTRO, REVISION, APROBADO, RECHAZADO
    razon_rechazo NVARCHAR(500) NULL, -- se usa solo si el estado es RECHAZADO
    actualizado_en DATETIME2 NULL,
    CONSTRAINT FK_Expediente_Tecnico FOREIGN KEY (tecnico_id) REFERENCES dicri.Usuario(id)
);

-- Tabla de indicios
CREATE TABLE dicri.Indicio (
    id INT IDENTITY(1,1) PRIMARY KEY,
    expediente_id INT NOT NULL,
    descripcion NVARCHAR(500) NOT NULL,
    color NVARCHAR(100) NULL,
    [tamaño] NVARCHAR(100) NULL,
    peso DECIMAL(10,2) NULL,
    ubicacion NVARCHAR(255) NULL,
    tecnico_id INT NOT NULL,
    fecha_registro DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Indicio_Expediente FOREIGN KEY (expediente_id) REFERENCES dicri.Expediente(id),
    CONSTRAINT FK_Indicio_Tecnico FOREIGN KEY (tecnico_id) REFERENCES dicri.Usuario(id)
);

-- Índices opcionales para optimizar búsquedas por estado
CREATE INDEX IX_Expediente_Estado ON dicri.Expediente(estado);
CREATE INDEX IX_Indicio_Expediente ON dicri.Indicio(expediente_id);
GO


CREATE PROCEDURE dicri.sp_ExpedientesEstado
AS
BEGIN
    SELECT estado, COUNT(*) AS total
    FROM dicri.Expediente
    GROUP BY estado;
END
GO


CREATE PROCEDURE dicri.sp_IndiciosPorExpediente
AS
BEGIN
    SELECT e.codigo_unico, COUNT(i.id) AS total_indicios
    FROM dicri.Expediente e
    LEFT JOIN dicri.Indicio i ON i.expediente_id = e.id
    GROUP BY e.codigo_unico;
END
GO


CREATE PROCEDURE dicri.sp_ExpedientesPorUsuario
AS
BEGIN
    SELECT u.nombre, COUNT(e.id) AS total_expedientes
    FROM dicri.Usuario u
    LEFT JOIN dicri.Expediente e ON e.tecnico_id = u.id
    GROUP BY u.nombre;
END
GO


CREATE PROCEDURE dicri.sp_ExpedientesPorCoordinador
AS
BEGIN
    SELECT u.nombre AS coordinador,
           SUM(CASE WHEN e.estado='APROBADO' THEN 1 ELSE 0 END) AS aprobados,
           SUM(CASE WHEN e.estado='RECHAZADO' THEN 1 ELSE 0 END) AS rechazados
    FROM dicri.Usuario u
    LEFT JOIN dicri.Expediente e ON e.tecnico_id = u.id
    WHERE u.rol = 'coordinador'
    GROUP BY u.nombre;
END
GO


CREATE PROCEDURE dicri.sp_ExpedientesPorMes
    @mes NVARCHAR(7) = NULL -- formato 'YYYY-MM'
AS
BEGIN
    IF @mes IS NOT NULL
    BEGIN
        SELECT FORMAT(fecha_registro,'yyyy-MM') AS mes, COUNT(*) AS total
        FROM dicri.Expediente
        WHERE FORMAT(fecha_registro,'yyyy-MM') = @mes
        GROUP BY FORMAT(fecha_registro,'yyyy-MM');
    END
    ELSE
    BEGIN
        SELECT TOP 4 FORMAT(fecha_registro,'yyyy-MM') AS mes, COUNT(*) AS total
        FROM dicri.Expediente
        GROUP BY FORMAT(fecha_registro,'yyyy-MM')
        ORDER BY mes DESC;
    END
END
GO


ALTER TABLE dicri.Expediente
ADD coordinador_id INT NULL;

ALTER TABLE dicri.Expediente
ADD CONSTRAINT FK_Expediente_Coordinador FOREIGN KEY (coordinador_id)
REFERENCES dicri.Usuario(id);

ALTER TABLE dicri.Expediente
ADD coordinador_id INT NULL;
