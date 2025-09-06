const mysql = require("mysql2/promise");
require("dotenv").config();

const host = process.env.DB_HOST.includes(":")
  ? `[${process.env.DB_HOST}]`
  : process.env.DB_HOST;

const pool = mysql.createPool({
  host: host,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false, // 👈 allow self-signed certs
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
