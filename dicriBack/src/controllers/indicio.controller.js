const { getPool, sql } = require('../services/db.service');

// Crear indicio (ya lo tienes)
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
      .input('peso', sql.Decimal(10,2), peso || null)
      .input('ubicacion', sql.NVarChar(255), ubicacion || null)
      .input('tecnico_id', sql.Int, tecnico_id)
      .execute('dicri.usp_InsertIndicio');

    res.status(201).json({ indicio_id: result.recordset[0].indicio_id });
  } catch (err) {
    next(err);
  }
};

// Listar todos los indicios
exports.getIndicios = async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query(`
        SELECT i.*, u.nombre AS tecnico_nombre, e.codigo_unico AS expediente_codigo
        FROM dicri.Indicio i
        INNER JOIN dicri.Usuario u ON i.tecnico_id = u.id
        INNER JOIN dicri.Expediente e ON i.expediente_id = e.id
        ORDER BY i.fecha_registro DESC
      `);

    // Mapear para frontend
    const indicios = result.recordset.map(i => ({
      id: i.id,
      descripcion: i.descripcion,
      color: i.color,
      tamano: i.tamaño,
      peso: i.peso,
      ubicacion: i.ubicacion,
      tecnico: { nombre: i.tecnico_nombre },
      expediente: { codigo_unico: i.expediente_codigo }
    }));

    res.json(indicios);
  } catch (err) {
    next(err);
  }
};

// Obtener detalle de un indicio por ID
exports.getIndicioById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const pool = await getPool();
    const result = await pool.request()
      .input('indicio_id', sql.Int, id)
      .query(`
        SELECT i.*, u.nombre AS tecnico_nombre, e.codigo_unico AS expediente_codigo
        FROM dicri.Indicio i
        INNER JOIN dicri.Usuario u ON i.tecnico_id = u.id
        INNER JOIN dicri.Expediente e ON i.expediente_id = e.id
        WHERE i.id = @indicio_id
      `);

    if (!result.recordset[0]) return res.status(404).json({ message: 'Indicio no encontrado' });

    const i = result.recordset[0];
    const indicio = {
      id: i.id,
      descripcion: i.descripcion,
      color: i.color,
      tamano: i.tamaño,
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
