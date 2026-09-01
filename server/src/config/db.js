const mysql = require('mysql2/promise');

// A pool (rather than a single connection) lets multiple requests query
// MySQL concurrently without waiting on each other, and automatically
// reconnects if a connection drops.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: ['DATE'], // return DATE columns as 'YYYY-MM-DD' strings, not JS Date objects
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;