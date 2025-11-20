const { getPool, sql } = require('../services/db.service');
const schema = process.env.DB_SCHEMA;

const getUserFromReq = (req) => ({
  id: req.user?.id,
  nombre: req.user?.nombre,
  correo: req.user?.correo,
  role: req.user?.rol || req.user?.role // admite ambos nombres si hay inconsistencia
});

// LISTAR EXPEDIENTES
exports.getExpedientesWithUser = async (req, res, next) => {
  try {
    const pool = await getPool();
    const expedientesResult = await pool.request().execute(`${schema}.usp_GetExpedientes`);

    res.json({
      expedientes: expedientesResult.recordset.map(e => ({
        ...e,
        estado: e.estado?.toLowerCase()
      })),
      user: getUserFromReq(req)
    });
  } catch (err) {
    next(err);
  }
};

// CREAR EXPEDIENTE
exports.createExpediente = async (req, res, next) => {
  try {
    const { codigo_unico, descripcion } = req.body;
    const tecnico_id = req.user.id;

    if (!codigo_unico || !codigo_unico.trim()) {
      return res.status(400).json({ message: "El código es obligatorio" });
    }

    if (!descripcion || descripcion.length < 10) {
      return res.status(400).json({ message: "La descripción es insuficiente" });
    }

    const pool = await getPool();

    // VALIDAR DUPLICADO ANTES DE INSERTAR
    const existe = await pool.request()
      .input("codigo_unico", sql.NVarChar(50), codigo_unico)
      .execute(`${schema}.usp_ValidarExpedienteDuplicado`);

    if (existe.recordset.length > 0) {
      return res.status(409).json({ message: "El código de expediente ya existe" });
    }

    // SI TODO VA BIEN INSERTAR
    const result = await pool.request()
      .input('codigo_unico', sql.NVarChar(50), codigo_unico)
      .input('descripcion', sql.NVarChar(500), descripcion)
      .input('tecnico_id', sql.Int, tecnico_id)
      .execute(`${schema}.usp_InsertExpediente`);

    res.status(201).json({ expediente_id: result.recordset[0].expediente_id });

  } catch (err) {
    next(err);
  }
};


// OBTENER EXPEDIENTE + INDICIOS
exports.getExpedienteWithIndicios = async (req, res, next) => {
  try {
    const expediente_id = Number(req.params.id);
    const userRole = (req.user?.rol || "").toLowerCase();

    const pool = await getPool();
    const result = await pool.request()
      .input('expediente_id', sql.Int, expediente_id)
      .execute(`${schema}.usp_GetExpedienteWithIndicios`);

    const expediente = result.recordsets?.[0]?.[0] || null;
    const indicios = result.recordsets?.[1] || [];

    if (!expediente) return res.status(404).json({ message: "Expediente no encontrado" });

    const estado = String(expediente.estado).toUpperCase();

    const canAddIndicios = !["REVISION", "RECHAZADO", "APROBADO"].includes(estado);
    const showRejectionReason = estado === "RECHAZADO";
    const allowCoordinatorActions = (estado === "REVISION" && userRole === "coordinador");
    const allowUserSubmitReview = (estado !== "REVISION" && userRole !== "coordinador");

    res.json({
      expediente,
      indicios,

      permissions: {
        canAddIndicios,
        showRejectionReason,
        allowCoordinatorActions,
        allowUserSubmitReview
      }
    });

  } catch (err) {
    next(err);
  }
};

// ENVIAR A REVISION
// Solo usuarios que NO sean coordinador pueden ejecutar esta accion.
exports.submitForReview = async (req, res, next) => {
  try {
    const userRole = (req.user?.rol || '').toLowerCase();
    if (userRole === 'coordinador') {
      return res.status(403).json({ message: 'Los coordinadores no pueden pasar expedientes a revisión.' });
    }

    const expediente_id = Number(req.params.id);
    const pool = await getPool();

    await pool.request()
      .input('expediente_id', sql.Int, expediente_id)
      .input('nuevo_estado', sql.NVarChar(20), 'REVISION')
      .input('razon_rechazo', sql.NVarChar(500), null)
      .input('actualizado_por', sql.Int, req.user.id)
      .execute(`${schema}.usp_UpdateExpedienteEstado`);

    res.json({ message: 'Expediente enviado a revisión' });
  } catch (err) {
    next(err);
  }
};

// FUNCION INTERNA: valida que expediente este en REVISION
const ensureExpedienteEnRevision = async (pool, id) => {
  const estadoResult = await pool.request()
    .input('expediente_id', sql.Int, id)
    .execute(`${schema}.usp_GetExpedienteEstado`); // SP que devuelve  estado 

  const estadoActual = estadoResult.recordset?.[0]?.estado;
  return estadoActual ? String(estadoActual).toLowerCase() === 'revision' : false;
};

// APROBAR expediente (solo coordinador y solo si estado == REVISION)
exports.approveExpediente = async (req, res, next) => {
  try {
    const userRole = (req.user?.rol || '').toLowerCase();
    if (userRole !== 'coordinador') {
      return res.status(403).json({ message: 'Solo coordinadores pueden aprobar expedientes.' });
    }

    const id = Number(req.params.id);
    const pool = await getPool();

    const enRevision = await ensureExpedienteEnRevision(pool, id);
    if (!enRevision) {
      return res.status(400).json({ message: 'El expediente aún no está en revisión.' });
    }

    await pool.request()
      .input('expediente_id', sql.Int, id)
      .input('nuevo_estado', sql.NVarChar(20), 'APROBADO')
      .input('razon_rechazo', sql.NVarChar(500), null)
      .input('actualizado_por', sql.Int, req.user.id)
      .input('coordinador_id', sql.Int, req.user.id) 
      .execute(`${schema}.usp_UpdateExpedienteEstado`);

    res.json({ message: 'Expediente aprobado.' });
  } catch (err) {
    next(err);
  }
};

// RECHAZAR expediente (solo coordinador y solo si estado == REVISION)
exports.rejectExpediente = async (req, res, next) => {
  try {
    const userRole = (req.user?.rol || '').toLowerCase();
    if (userRole !== 'coordinador') {
      return res.status(403).json({ message: 'Solo coordinadores pueden rechazar expedientes.' });
    }

    const id = Number(req.params.id);
    const { razon_rechazo } = req.body || {};

    const pool = await getPool();
    const enRevision = await ensureExpedienteEnRevision(pool, id);
    if (!enRevision) {
      return res.status(400).json({ message: 'El expediente aún no está en revisión.' });
    }

    if (!razon_rechazo || !razon_rechazo.trim()) {
      return res.status(400).json({ message: 'Se requiere justificación para rechazar.' });
    }

    await pool.request()
      .input('expediente_id', sql.Int, id)
      .input('nuevo_estado', sql.NVarChar(20), 'RECHAZADO')
      .input('razon_rechazo', sql.NVarChar(500), razon_rechazo)
      .input('actualizado_por', sql.Int, req.user.id)
      .input('coordinador_id', sql.Int, req.user.id)
      .execute(`${schema}.usp_UpdateExpedienteEstado`);

    res.json({ message: 'Expediente rechazado.' });
  } catch (err) {
    next(err);
  }
};

// UPDATE REVISION
exports.updateRevision = async (req, res, next) => {
  try {
    const { estado, justificacion } = req.body;
    const id = Number(req.params.id);

    const pool = await getPool();
    const result = await pool.request()
      .input('expediente_id', sql.Int, id)
      .input('estado', sql.NVarChar(20), estado)
      .input('justificacion', sql.NVarChar(500), justificacion || null)
      .execute(`${schema}.usp_UpdateExpedienteRevision`);

    res.json({ message: 'Expediente actualizado', updated: result.rowsAffected[0] });
  } catch (err) {
    next(err);
  }
};
