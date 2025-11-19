const { getPool, sql } = require('../services/db.service');
const schema = process.env.DB_SCHEMA;

// Crear indicio
exports.createIndicio = async (req, res, next) => {
  try {
    const { expediente_id, descripcion, color, tamano, peso, ubicacion } = req.body;
    const tecnico_id = req.user.id;
    const pool = await getPool();

    const result = await pool.request()
      .input('expediente_id', sql.Int, expediente_id)
      .input('descripcion', sql.NVarChar(500), descripcion)
      .input('color', sql.NVarChar(100), color || null)
      .input('tamano', sql.NVarChar(100), tamano || null)
      .input('peso', sql.Decimal(10, 2), peso || null)
      .input('ubicacion', sql.NVarChar(255), ubicacion || null)
      .input('tecnico_id', sql.Int, tecnico_id)
      .execute(`${schema}.usp_InsertIndicio`);

    res.status(201).json({ indicio_id: result.recordset[0].indicio_id });
  } catch (err) {
    next(err);
  }
};

// Obtener todos los indicios, opcionalmente filtrando por expediente
exports.getAllIndicios = async (req, res) => {
  try {
    const pool = await getPool();
    const { expedienteId } = req.query;

    const request = pool.request();
    if (expedienteId) request.input('expedienteId', sql.Int, expedienteId);

    const result = await request.execute(`${schema}.usp_GetIndicios`);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener indicios" });
  }
};

// Obtener detalle de un indicio por ID
exports.getIndicioById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const pool = await getPool();

    const result = await pool.request()
      .input('indicioId', sql.Int, id)
      .execute(`${schema}.usp_GetIndicioById`);

    if (!result.recordset[0]) return res.status(404).json({ message: 'Indicio no encontrado' });

    const i = result.recordset[0];
    const indicio = {
      id: i.id,
      descripcion: i.descripcion,
      color: i.color,
      tamano: i.tamano,
      peso: i.peso,
      ubicacion: i.ubicacion,
      tecnico: { nombre: i.tecnico_nombre },
      expediente: { codigo_unico: i.expediente_codigo }
    };

    res.json(indicio);
  } catch (err) {
    next(err);
  }
};

// Listar todos los indicios
exports.getIndicios = async (req, res) => {
  try {
    const { expedienteCodigo } = req.query; 
    const pool = await getPool();
    let result;

    if (expedienteCodigo) {
      result = await pool.request()
        .input('expediente_codigo', sql.NVarChar(50), expedienteCodigo)
        .execute(`${schema}.usp_GetIndiciosByExpediente`);
    } else {
      result = await pool.request()
        .execute(`${schema}.usp_GetAllIndicios`);
    }

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener indicios' });
  }
};

exports.deleteIndicio = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const pool = await getPool();

    const result = await pool.request()
      .input("indicioId", sql.Int, id)
      .execute(`${schema}.usp_DeleteIndicio`);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Indicio no encontrado" });
    }

    res.json({ message: "Indicio eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar indicio" });
  }
};