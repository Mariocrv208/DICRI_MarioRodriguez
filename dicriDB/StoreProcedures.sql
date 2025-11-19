-- 1_procs.sql
USE dicri_db;
GO

CREATE PROCEDURE dicri.usp_InsertExpediente
  @codigo_unico NVARCHAR(50),
  @descripcion NVARCHAR(500),
  @tecnico_id INT
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dicri.Expediente (codigo_unico, descripcion, tecnico_id)
  VALUES (@codigo_unico, @descripcion, @tecnico_id);

  SELECT SCOPE_IDENTITY() AS expediente_id;
END;
GO

CREATE PROCEDURE dicri.usp_UpdateExpedienteEstado
  @expediente_id INT,
  @nuevo_estado NVARCHAR(20),
  @razon_rechazo NVARCHAR(500) = NULL,
  @actualizado_por INT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dicri.Expediente
  SET estado = @nuevo_estado,
      razon_rechazo = @razon_rechazo,
      actualizado_en = SYSUTCDATETIME()
  WHERE id = @expediente_id;

  SELECT @@ROWCOUNT AS rows;
END;
GO

CREATE PROCEDURE dicri.usp_InsertIndicio
  @expediente_id INT,
  @descripcion NVARCHAR(500),
  @color NVARCHAR(100) = NULL,
  @tamano NVARCHAR(100) = NULL,
  @peso DECIMAL(10,2) = NULL,
  @ubicacion NVARCHAR(255) = NULL,
  @tecnico_id INT
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dicri.Indicio (expediente_id, descripcion, color, [tamaño], peso, ubicacion, tecnico_id)
  VALUES (@expediente_id, @descripcion, @color, @tamano, @peso, @ubicacion, @tecnico_id);

  SELECT SCOPE_IDENTITY() AS indicio_id;
END;
GO

CREATE PROCEDURE dicri.usp_GetExpedienteWithIndicios
  @expediente_id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT * FROM dicri.Expediente WHERE id = @expediente_id;
  SELECT * FROM dicri.Indicio WHERE expediente_id = @expediente_id;
END;
GO

CREATE PROCEDURE dicri.usp_GetIndicios
    @expedienteId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.id,
        i.descripcion,
        i.color,
        i.[tamaño] AS tamano,
        i.peso,
        i.ubicacion,
        i.expediente_id,
        e.codigo_unico AS expediente_codigo,
        t.nombre AS tecnico_nombre
    FROM dicri.Indicio i
    INNER JOIN dicri.Expediente e ON i.expediente_id = e.id
    INNER JOIN dicri.Usuario t ON i.tecnico_id = t.id
    WHERE (@expedienteId IS NULL OR i.expediente_id = @expedienteId)
    ORDER BY i.id ASC;
END
GO

CREATE PROCEDURE dicri.usp_GetIndicioById
    @indicioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.*, 
        u.nombre AS tecnico_nombre, 
        e.codigo_unico AS expediente_codigo
    FROM dicri.Indicio i
    INNER JOIN dicri.Usuario u ON i.tecnico_id = u.id
    INNER JOIN dicri.Expediente e ON i.expediente_id = e.id
    WHERE i.id = @indicioId;
END
GO

-- SP para obtener todos los indicios
CREATE PROCEDURE dicri.usp_GetAllIndicios
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.id,
        i.descripcion,
        i.color,
        i.[tamaño] AS tamano,
        i.peso,
        i.ubicacion,
        i.expediente_id,
        e.codigo_unico AS expediente_codigo,
        t.nombre AS tecnico_nombre
    FROM dicri.Indicio i
    INNER JOIN dicri.Expediente e ON i.expediente_id = e.id
    INNER JOIN dicri.Usuario t ON i.tecnico_id = t.id
    ORDER BY i.id ASC;
END

GO

-- SP para obtener indicios por código de expediente
CREATE PROCEDURE dicri.usp_GetIndiciosByExpediente
    @expediente_codigo NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.id,
        i.descripcion,
        i.color,
        i.[tamaño] AS tamano,
        i.peso,
        i.ubicacion,
        i.expediente_id,
        e.codigo_unico AS expediente_codigo,
        t.nombre AS tecnico_nombre
    FROM dicri.Indicio i
    INNER JOIN dicri.Expediente e ON i.expediente_id = e.id
    INNER JOIN dicri.Usuario t ON i.tecnico_id = t.id
    WHERE e.codigo_unico = @expediente_codigo
    ORDER BY i.id ASC;
END

GO

-- Crear procedimiento para actualizar estado y justificación de un expediente
CREATE PROCEDURE dicri.usp_UpdateExpedienteRevision
    @expediente_id INT,
    @estado NVARCHAR(20),
    @justificacion NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Verificar que el expediente exista
    IF NOT EXISTS (SELECT 1 FROM dicri.Expediente WHERE id = @expediente_id)
    BEGIN
        RAISERROR('Expediente no encontrado', 16, 1);
        RETURN;
    END

    -- Actualizar el expediente
    UPDATE dicri.Expediente
    SET
        estado = @estado,
        razon_rechazo = CASE WHEN @estado = 'RECHAZADO' THEN @justificacion ELSE NULL END,
        actualizado_en = SYSUTCDATETIME()
    WHERE id = @expediente_id;
END
GO

-- usp_GetExpedientes.sql
CREATE PROCEDURE dicri.usp_GetExpedientes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        e.id,
        e.codigo_unico,
        e.descripcion,
        e.estado,
        e.fecha_registro,
        u.nombre AS tecnico
    FROM dicri.Expediente e
    JOIN dicri.Usuario u ON e.tecnico_id = u.id
    ORDER BY e.fecha_registro DESC;
END
GO

USE dicri_db;
GO

CREATE PROCEDURE dicri.usp_GetExpedienteEstado
    @expediente_id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        estado,
        razon_rechazo,
        actualizado_en
    FROM dicri.Expediente
    WHERE id = @expediente_id;
END;
GO

ALTER PROCEDURE dicri.usp_UpdateExpedienteRevision
    @expediente_id INT,
    @estado NVARCHAR(20),
    @justificacion NVARCHAR(500) = NULL,
    @coordinador_id INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dicri.Expediente
    SET
        estado = @estado,
        razon_rechazo = CASE WHEN @estado = 'RECHAZADO' THEN @justificacion ELSE NULL END,
        coordinador_id = @coordinador_id,
        actualizado_en = SYSUTCDATETIME()
    WHERE id = @expediente_id;
END;
GO

CREATE PROCEDURE dicri.sp_ExpedientesPorCoordinador
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        u.nombre AS coordinador,
        SUM(CASE WHEN e.estado = 'aprobado' THEN 1 ELSE 0 END) AS aprobados,
        SUM(CASE WHEN e.estado = 'rechazado' THEN 1 ELSE 0 END) AS rechazados
    FROM dicri.Expediente e
    INNER JOIN dicri.Usuario u ON u.id = e.coordinador_id
    GROUP BY u.nombre;
END;
GO



ALTER PROCEDURE dicri.sp_ExpedientesPorCoordinador
AS
BEGIN
    SELECT 
        u.nombre AS coordinador,
        SUM(CASE WHEN e.estado = 'APROBADO' THEN 1 ELSE 0 END) AS aprobados,
        SUM(CASE WHEN e.estado = 'RECHAZADO' THEN 1 ELSE 0 END) AS rechazados
    FROM dicri.Usuario u
    LEFT JOIN dicri.Expediente e ON e.coordinador_id = u.id
    WHERE u.rol = 'coordinador'
    GROUP BY u.nombre;
END
GO
