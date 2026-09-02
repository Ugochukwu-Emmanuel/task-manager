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
  // TiDB Cloud (and most managed DB hosts) require SSL; local MySQL
  // doesn't use it at all. DB_SSL=true switches this on — set it in
  // Render's environment variables for production, leave it unset
  // locally. TiDB's certificate is publicly trusted (like a normal
  // website's), so Node's built-in CA list is enough — no need to
  // bundle a custom certificate file.
  ...(process.env.DB_SSL === 'true' && {
    ssl: { rejectUnauthorized: true },
  }),
});

module.exports = pool;