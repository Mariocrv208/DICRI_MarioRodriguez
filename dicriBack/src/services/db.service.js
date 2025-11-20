const sql = require('mssql');
const dotenv = require('dotenv');
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // para conexiones locales no necesitas encrypt
    trustServerCertificate: true
  }
};

let poolPromise = null;

async function getPool() {
  if (!poolPromise) {
    try {
      poolPromise = await sql.connect(config);
      console.log("Conexión exitosa a SQL Server desde otro contenedor");
    } catch (err) {
      console.error("Error conectando a SQL:", err);
      throw err;
    }
  }
  return poolPromise;
}

module.exports = { sql, getPool };
