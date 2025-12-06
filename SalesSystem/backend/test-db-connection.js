const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing MySQL connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL');

    const [tables] = await conn.query('SHOW TABLES');
    console.log('📋 Tables:', tables);

    const [users] = await conn.query('SELECT id, name, email, role FROM users');
    console.log('👥 Users:', users);

    conn.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Full error:', err);
  }
}

testConnection();
