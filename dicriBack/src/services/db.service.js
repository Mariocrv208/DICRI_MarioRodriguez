const sql = require('mssql/msnodesqlv8');
const dotenv = require('dotenv');
dotenv.config();

const config = {
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,  // Windows Authentication
  }
};

let poolPromise = null;

async function getPool() {
  if (!poolPromise) {
    try {
      poolPromise = sql.connect(config);
      console.log("Conexión exitosa a SQL Server con Windows Authentication");
    } catch (err) {
      console.error("Error conectando a SQL:", err);
      throw err;
    }
  }
  return poolPromise;
}

module.exports = { sql, getPool };
