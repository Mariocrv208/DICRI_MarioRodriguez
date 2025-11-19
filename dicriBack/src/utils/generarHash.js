const bcrypt = require('bcrypt');

/**
 * Genera un hash para la contraseña dada
 */
async function generarHash(password) {
  try {
    const hash = await bcrypt.hash(password, 10); // 10 salt rounds
    console.log("Hash generado:", hash);
    console.log("Copia este hash en tu base de datos para este usuario");
  } catch (err) {
    console.error("Error generando hash:", err);
  }
}

// Cambia esta contraseña por la que quieras generar
const password = 'extremobase';

generarHash(password);
