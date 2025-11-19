// backend/controllers/dashboardController.js
const { getPool, sql } = require('../services/db.service');

// 1. Cantidad de expedientes por estado
const getExpedientesEstado = async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('dicri.sp_ExpedientesEstado');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
};

// 2. Cantidad de indicios por expediente
const getIndiciosPorExpediente = async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('dicri.sp_IndiciosPorExpediente');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
};

// 3. Cantidad de expedientes por usuario (técnicos)
const getExpedientesPorUsuario = async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('dicri.sp_ExpedientesPorUsuario');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
};

// 4. Cantidad de expedientes aprobados/rechazados por coordinador
const getExpedientesPorCoordinador = async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('dicri.sp_ExpedientesPorCoordinador');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
};

// 5. Cantidad de expedientes ingresados por mes (máx 4 meses, filtro opcional)
const getExpedientesPorMes = async (req, res, next) => {
  try {
    const pool = await getPool();
    const { mes } = req.query; // formato YYYY-MM

    const request = pool.request();
    if (mes) {
      request.input('mes', sql.NVarChar(7), mes);
    }

    const result = await request.execute('dicri.sp_ExpedientesPorMes');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExpedientesEstado,
  getIndiciosPorExpediente,
  getExpedientesPorUsuario,
  getExpedientesPorCoordinador,
  getExpedientesPorMes
};
