const { getPool, sql } = require('../services/db.service');

// Crear expediente
exports.createExpediente = async (req, res, next) => {
  try {
    const { codigo_unico, descripcion } = req.body;
    const tecnico_id = req.user.id;

    const pool = await getPool();

    const result = await pool.request()
      .input('codigo_unico', sql.NVarChar(50), codigo_unico)
      .input('descripcion', sql.NVarChar(500), descripcion)
      .input('tecnico_id', sql.Int, tecnico_id)
      .execute('dicri.usp_InsertExpediente');

    const expediente_id = result.recordset[0].expediente_id;
    res.status(201).json({ expediente_id });
  } catch (err) {
    next(err);
  }
};

// Listar todos los expedientes
exports.getExpedientes = async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .query(`
        SELECT e.id, e.codigo_unico, e.descripcion, e.estado, e.fecha_registro, u.nombre AS tecnico
        FROM dicri.Expediente e
        JOIN dicri.Usuario u ON e.tecnico_id = u.id
        ORDER BY e.fecha_registro DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
};

// Obtener expediente con indicios
exports.getExpedienteWithIndicios = async (req, res, next) => {
  try {
    const expediente_id = parseInt(req.params.id, 10);
    const pool = await getPool();

    const result = await pool.request()
      .input('expediente_id', sql.Int, expediente_id)
      .execute('dicri.usp_GetExpedienteWithIndicios');

    const expediente = result.recordsets?.[0]?.[0] || null;
    const indicios = result.recordsets?.[1] || [];

    res.json({ expediente, indicios });
  } catch (err) {
    next(err);
  }
};

// Enviar a revisión
exports.submitForReview = async (req, res, next) => {
  try {
    const expediente_id = parseInt(req.params.id, 10);
    const pool = await getPool();

    await pool.request()
      .input('expediente_id', sql.Int, expediente_id)
      .input('nuevo_estado', sql.NVarChar(20), 'EN_REVISION')
      .input('razon_rechazo', sql.NVarChar(500), null)
      .input('actualizado_por', sql.Int, req.user.id)
      .execute('dicri.usp_UpdateExpedienteEstado');

    res.json({ message: 'Expediente enviado a revisión' });
  } catch (err) {
    next(err);
  }
};

// Aprobar expediente
exports.approveExpediente = async (req, res, next) => {
  try {
    const expediente_id = parseInt(req.params.id, 10);
    const pool = await getPool();

    await pool.request()
      .input('expediente_id', sql.Int, expediente_id)
      .input('nuevo_estado', sql.NVarChar(20), 'APROBADO')
      .input('razon_rechazo', sql.NVarChar(500), null)
      .input('actualizado_por', sql.Int, req.user.id)
      .execute('dicri.usp_UpdateExpedienteEstado');

    res.json({ message: 'Expediente aprobado' });
  } catch (err) {
    next(err);
  }
};

// Rechazar expediente
exports.rejectExpediente = async (req, res, next) => {
  try {
    const expediente_id = parseInt(req.params.id, 10);
    const { razon_rechazo } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('expediente_id', sql.Int, expediente_id)
      .input('nuevo_estado', sql.NVarChar(20), 'RECHAZADO')
      .input('razon_rechazo', sql.NVarChar(500), razon_rechazo)
      .input('actualizado_por', sql.Int, req.user.id)
      .execute('dicri.usp_UpdateExpedienteEstado');

    res.json({ message: 'Expediente rechazado' });
  } catch (err) {
    next(err);
  }
};
