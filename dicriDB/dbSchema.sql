-- 0_schema_modificado.sql
CREATE DATABASE dicri_db2;
GO
USE dicri_db2;
GO

CREATE SCHEMA dicri2;
GO

-- Tabla de usuarios
CREATE TABLE dicri2.Usuario (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    correo NVARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol NVARCHAR(50) NOT NULL, -- ejemplo: "tecnico", "coordinador"
    creado_en DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- Tabla de expedientes
CREATE TABLE dicri2.Expediente (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo_unico NVARCHAR(50) NOT NULL UNIQUE,
    descripcion NVARCHAR(500) NOT NULL,
    fecha_registro DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    tecnico_id INT NOT NULL,
    estado NVARCHAR(20) NOT NULL DEFAULT 'EN_REGISTRO', -- EN_REGISTRO, REVISION, APROBADO, RECHAZADO
    razon_rechazo NVARCHAR(500) NULL, -- se usa solo si el estado es RECHAZADO
    actualizado_en DATETIME2 NULL,
    CONSTRAINT FK_Expediente_Tecnico FOREIGN KEY (tecnico_id) REFERENCES dicri2.Usuario(id)
);

-- Tabla de indicios
CREATE TABLE dicri2.Indicio (
    id INT IDENTITY(1,1) PRIMARY KEY,
    expediente_id INT NOT NULL,
    descripcion NVARCHAR(500) NOT NULL,
    color NVARCHAR(100) NULL,
    [tamaño] NVARCHAR(100) NULL,
    peso DECIMAL(10,2) NULL,
    ubicacion NVARCHAR(255) NULL,
    tecnico_id INT NOT NULL,
    fecha_registro DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Indicio_Expediente FOREIGN KEY (expediente_id) REFERENCES dicri2.Expediente(id),
    CONSTRAINT FK_Indicio_Tecnico FOREIGN KEY (tecnico_id) REFERENCES dicri2.Usuario(id)
);

-- Índices opcionales para optimizar búsquedas por estado
CREATE INDEX IX_Expediente_Estado ON dicri2.Expediente(estado);
CREATE INDEX IX_Indicio_Expediente ON dicri2.Indicio(expediente_id);
GO


ALTER TABLE dicri2.Expediente
ADD coordinador_id INT NULL;

ALTER TABLE dicri2.Expediente
ADD CONSTRAINT FK_Expediente_Coordinador FOREIGN KEY (coordinador_id)
REFERENCES dicri2.Usuario(id);


ALTER PROCEDURE dicri2.usp_InsertExpediente 
    @codigo_unico NVARCHAR(50),
    @descripcion NVARCHAR(500),
    @tecnico_id INT
AS
BEGIN
    -- VALIDAR DUPLICADO
    IF EXISTS (SELECT 1 FROM dicri2.Expediente WHERE codigo_unico = @codigo_unico)
    BEGIN
        RAISERROR('EXPEDIENTE_DUPLICADO', 16, 1);
        RETURN;
    END

    INSERT INTO dicri2.Expediente (codigo_unico, descripcion, tecnico_id)
    VALUES (@codigo_unico, @descripcion, @tecnico_id);

    SELECT SCOPE_IDENTITY() AS expediente_id;
END
GO



