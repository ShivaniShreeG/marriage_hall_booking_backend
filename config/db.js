const mysql = require("mysql2/promise");
const CONFIG = require("./config"); // ✅ use config.js, not server.js

const host = CONFIG.DB_HOST.includes(":") ? `[${CONFIG.DB_HOST}]` : CONFIG.DB_HOST;

const pool = mysql.createPool({
  host: host,
  user: CONFIG.DB_USER,
  password: CONFIG.DB_PASSWORD,
  database: CONFIG.DB_NAME,
  port: CONFIG.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to Online MySQL Database");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
})();

module.exports = pool;
