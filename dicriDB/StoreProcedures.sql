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