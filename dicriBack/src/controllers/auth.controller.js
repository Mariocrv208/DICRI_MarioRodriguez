const { getPool, sql } = require('../services/db.service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

exports.login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    const pool = await getPool();
    const result = await pool.request()
      .input('correo', sql.NVarChar(150), correo) 
      .query(`
        SELECT id, nombre, correo, password_hash, rol 
        FROM dicri.Usuario 
        WHERE correo = @correo
      `);

    if (!result.recordset.length) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = result.recordset[0];

    const hash = user.password_hash.toString('utf8').trim();

    const match = await bcrypt.compare(password, hash);
    if (!match) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const payload = {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h"
    });

    res.json({ token, user: payload });

  } catch (err) {
    next(err);
  }
};
