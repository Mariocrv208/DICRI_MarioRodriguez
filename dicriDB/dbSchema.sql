-- 0_schema.sql
CREATE DATABASE dicri_db;
GO
USE dicri_db;
GO

CREATE SCHEMA dicri;
GO

CREATE TABLE dicri.Usuario (
  id INT IDENTITY(1,1) PRIMARY KEY,
  nombre NVARCHAR(100) NOT NULL,
  correo NVARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol NVARCHAR(50) NOT NULL,
  creado_en DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dicri.Expediente (
  id INT IDENTITY(1,1) PRIMARY KEY,
  codigo_unico NVARCHAR(50) NOT NULL UNIQUE,
  descripcion NVARCHAR(500) NOT NULL,
  fecha_registro DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  tecnico_id INT NOT NULL,
  estado NVARCHAR(20) NOT NULL DEFAULT 'EN_REGISTRO',
  razon_rechazo NVARCHAR(500) NULL,
  actualizado_en DATETIME2 NULL,
  CONSTRAINT FK_Expediente_Tecnico FOREIGN KEY (tecnico_id) REFERENCES dicri.Usuario(id)
);

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
GO