const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'database_book'
  });

  try {
    const [rows] = await connection.execute(`SELECT INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns, NON_UNIQUE, COUNT(*) AS col_count FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' GROUP BY INDEX_NAME, NON_UNIQUE`, [process.env.DB_NAME || 'database_book']);
    console.log('Indexes for table `users`:');
    rows.forEach(r => {
      console.log(`- ${r.INDEX_NAME} | non_unique=${r.NON_UNIQUE} | cols=${r.columns} | col_count=${r.col_count}`);
    });
  } catch (err) {
    console.error('Error inspecting indexes:', err.message || err);
  } finally {
    await connection.end();
  }
})();
