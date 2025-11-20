-- 1_procs.sql
USE dicri_db2;
GO

CREATE PROCEDURE dicri2.usp_InsertExpediente
  @codigo_unico NVARCHAR(50),
  @descripcion NVARCHAR(500),
  @tecnico_id INT
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dicri2.Expediente (codigo_unico, descripcion, tecnico_id)
  VALUES (@codigo_unico, @descripcion, @tecnico_id);

  SELECT SCOPE_IDENTITY() AS expediente_id;
END;
GO

CREATE PROCEDURE dicri2.usp_UpdateExpedienteEstado
  @expediente_id INT,
  @nuevo_estado NVARCHAR(20),
  @razon_rechazo NVARCHAR(500) = NULL,
  @actualizado_por INT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dicri2.Expediente
  SET estado = @nuevo_estado,
      razon_rechazo = @razon_rechazo,
      actualizado_en = SYSUTCDATETIME()
  WHERE id = @expediente_id;

  SELECT @@ROWCOUNT AS rows;
END;
GO

CREATE PROCEDURE dicri2.usp_InsertIndicio
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
  INSERT INTO dicri2.Indicio (expediente_id, descripcion, color, [tamaño], peso, ubicacion, tecnico_id)
  VALUES (@expediente_id, @descripcion, @color, @tamano, @peso, @ubicacion, @tecnico_id);

  SELECT SCOPE_IDENTITY() AS indicio_id;
END;
GO

CREATE PROCEDURE dicri2.usp_GetExpedienteWithIndicios
  @expediente_id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT * FROM dicri2.Expediente WHERE id = @expediente_id;
  SELECT * FROM dicri2.Indicio WHERE expediente_id = @expediente_id;
END;
GO

CREATE PROCEDURE dicri2.usp_GetIndicios
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
    FROM dicri2.Indicio i
    INNER JOIN dicri2.Expediente e ON i.expediente_id = e.id
    INNER JOIN dicri2.Usuario t ON i.tecnico_id = t.id
    WHERE (@expedienteId IS NULL OR i.expediente_id = @expedienteId)
    ORDER BY i.id ASC;
END
GO

CREATE PROCEDURE dicri2.usp_GetIndicioById
    @indicioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.*, 
        u.nombre AS tecnico_nombre, 
        e.codigo_unico AS expediente_codigo
    FROM dicri2.Indicio i
    INNER JOIN dicri2.Usuario u ON i.tecnico_id = u.id
    INNER JOIN dicri2.Expediente e ON i.expediente_id = e.id
    WHERE i.id = @indicioId;
END
GO

-- SP para obtener todos los indicios
CREATE PROCEDURE dicri2.usp_GetAllIndicios
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
    FROM dicri2.Indicio i
    INNER JOIN dicri2.Expediente e ON i.expediente_id = e.id
    INNER JOIN dicri2.Usuario t ON i.tecnico_id = t.id
    ORDER BY i.id ASC;
END

GO

-- SP para obtener indicios por código de expediente
CREATE PROCEDURE dicri2.usp_GetIndiciosByExpediente
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
    FROM dicri2.Indicio i
    INNER JOIN dicri2.Expediente e ON i.expediente_id = e.id
    INNER JOIN dicri2.Usuario t ON i.tecnico_id = t.id
    WHERE e.codigo_unico = @expediente_codigo
    ORDER BY i.id ASC;
END

GO

-- Crear procedimiento para actualizar estado y justificación de un expediente
CREATE PROCEDURE dicri2.usp_UpdateExpedienteRevision
    @expediente_id INT,
    @estado NVARCHAR(20),
    @justificacion NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Verificar que el expediente exista
    IF NOT EXISTS (SELECT 1 FROM dicri2.Expediente WHERE id = @expediente_id)
    BEGIN
        RAISERROR('Expediente no encontrado', 16, 1);
        RETURN;
    END

    -- Actualizar el expediente
    UPDATE dicri2.Expediente
    SET
        estado = @estado,
        razon_rechazo = CASE WHEN @estado = 'RECHAZADO' THEN @justificacion ELSE NULL END,
        actualizado_en = SYSUTCDATETIME()
    WHERE id = @expediente_id;
END
GO

-- usp_GetExpedientes.sql
CREATE PROCEDURE dicri2.usp_GetExpedientes
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
    FROM dicri2.Expediente e
    JOIN dicri2.Usuario u ON e.tecnico_id = u.id
    ORDER BY e.fecha_registro DESC;
END
GO


CREATE PROCEDURE dicri2.usp_GetExpedienteEstado
    @expediente_id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        estado,
        razon_rechazo,
        actualizado_en
    FROM dicri2.Expediente
    WHERE id = @expediente_id;
END;
GO

ALTER PROCEDURE dicri2.usp_UpdateExpedienteRevision
    @expediente_id INT,
    @estado NVARCHAR(20),
    @justificacion NVARCHAR(500) = NULL,
    @coordinador_id INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dicri2.Expediente
    SET
        estado = @estado,
        razon_rechazo = CASE WHEN @estado = 'RECHAZADO' THEN @justificacion ELSE NULL END,
        coordinador_id = @coordinador_id,
        actualizado_en = SYSUTCDATETIME()
    WHERE id = @expediente_id;
END;
GO

CREATE PROCEDURE dicri2.sp_ExpedientesPorCoordinador
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        u.nombre AS coordinador,
        SUM(CASE WHEN e.estado = 'aprobado' THEN 1 ELSE 0 END) AS aprobados,
        SUM(CASE WHEN e.estado = 'rechazado' THEN 1 ELSE 0 END) AS rechazados
    FROM dicri2.Expediente e
    INNER JOIN dicri2.Usuario u ON u.id = e.coordinador_id
    GROUP BY u.nombre;
END;
GO



ALTER PROCEDURE dicri2.sp_ExpedientesPorCoordinador
AS
BEGIN
    SELECT 
        u.nombre AS coordinador,
        SUM(CASE WHEN e.estado = 'APROBADO' THEN 1 ELSE 0 END) AS aprobados,
        SUM(CASE WHEN e.estado = 'RECHAZADO' THEN 1 ELSE 0 END) AS rechazados
    FROM dicri2.Usuario u
    LEFT JOIN dicri2.Expediente e ON e.coordinador_id = u.id
    WHERE u.rol = 'coordinador'
    GROUP BY u.nombre;
END
GO


CREATE PROCEDURE dicri2.sp_ActualizarEstadoExpediente
    @expediente_id INT,
    @nuevo_estado NVARCHAR(20),
    @coordinador_id INT,
    @razon_rechazo NVARCHAR(500) = NULL
AS
BEGIN
    UPDATE dicri2.Expediente
    SET estado = @nuevo_estado,
        razon_rechazo = @razon_rechazo,
        coordinador_id = @coordinador_id,
        actualizado_en = SYSUTCDATETIME()
    WHERE id = @expediente_id;
END
GO


-- ALTER para que acepte coordinador_id (manteniendo parámetros previos).
ALTER PROCEDURE dicri2.usp_UpdateExpedienteEstado
  @expediente_id INT,
  @nuevo_estado NVARCHAR(20),
  @razon_rechazo NVARCHAR(500) = NULL,
  @actualizado_por INT = NULL,
  @coordinador_id INT = NULL    -- nuevo parámetro opcional
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE dicri2.Expediente
  SET estado = @nuevo_estado,
      razon_rechazo = @razon_rechazo,
      actualizado_en = SYSUTCDATETIME(),
      -- Si se pasa coordinador_id lo setea, si no, conserva el valor actual
      coordinador_id = COALESCE(@coordinador_id, coordinador_id)
  WHERE id = @expediente_id;

  SELECT @@ROWCOUNT AS rows;
END;
GO





CREATE PROCEDURE dicri2.sp_ExpedientesEstado
AS
BEGIN
    SELECT estado, COUNT(*) AS total
    FROM dicri2.Expediente
    GROUP BY estado;
END
GO


CREATE PROCEDURE dicri2.sp_IndiciosPorExpediente
AS
BEGIN
    SELECT e.codigo_unico, COUNT(i.id) AS total_indicios
    FROM dicri2.Expediente e
    LEFT JOIN dicri2.Indicio i ON i.expediente_id = e.id
    GROUP BY e.codigo_unico;
END
GO


CREATE PROCEDURE dicri2.sp_ExpedientesPorUsuario
AS
BEGIN
    SELECT u.nombre, COUNT(e.id) AS total_expedientes
    FROM dicri2.Usuario u
    LEFT JOIN dicri2.Expediente e ON e.tecnico_id = u.id
    GROUP BY u.nombre;
END
GO


CREATE PROCEDURE dicri2.sp_ExpedientesPorCoordinador
AS
BEGIN
    SELECT u.nombre AS coordinador,
           SUM(CASE WHEN e.estado='APROBADO' THEN 1 ELSE 0 END) AS aprobados,
           SUM(CASE WHEN e.estado='RECHAZADO' THEN 1 ELSE 0 END) AS rechazados
    FROM dicri2.Usuario u
    LEFT JOIN dicri2.Expediente e ON e.tecnico_id = u.id
    WHERE u.rol = 'coordinador'
    GROUP BY u.nombre;
END
GO


CREATE PROCEDURE dicri2.sp_ExpedientesPorMes
    @mes NVARCHAR(7) = NULL -- formato 'YYYY-MM'
AS
BEGIN
    IF @mes IS NOT NULL
    BEGIN
        SELECT FORMAT(fecha_registro,'yyyy-MM') AS mes, COUNT(*) AS total
        FROM dicri2.Expediente
        WHERE FORMAT(fecha_registro,'yyyy-MM') = @mes
        GROUP BY FORMAT(fecha_registro,'yyyy-MM');
    END
    ELSE
    BEGIN
        SELECT TOP 4 FORMAT(fecha_registro,'yyyy-MM') AS mes, COUNT(*) AS total
        FROM dicri2.Expediente
        GROUP BY FORMAT(fecha_registro,'yyyy-MM')
        ORDER BY mes DESC;
    END
END
GO


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


CREATE PROCEDURE dicri2.sp_ObtenerUsuarioPorCorreo
    @correo NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        id,
        nombre,
        correo,
        password_hash,
        rol
    FROM dicri2.Usuario
    WHERE correo = @correo;
END;
GO

CREATE OR ALTER PROCEDURE dicri2.usp_ValidarExpedienteDuplicado
    @codigo_unico NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT id
    FROM dicri2.Expediente
    WHERE codigo_unico = @codigo_unico;
END
GO

CREATE OR ALTER PROCEDURE dicri2.usp_DeleteIndicio
    @indicioId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dicri2.Indicio
    WHERE id = @indicioId;
END
GO
