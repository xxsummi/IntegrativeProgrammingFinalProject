#!/usr/bin/env node
// backend/scripts/change_password.js
// Usage: node change_password.js --email user@example.com --password newpass
// Or: node change_password.js --id 2 --password newpass

const pool = require('../src/db');
const bcrypt = require('bcrypt');

const argv = require('minimist')(process.argv.slice(2));

async function main() {
  const { email, id, password } = argv;
  if (!password) {
    console.error('Missing --password argument');
    process.exit(2);
  }
  if (!email && !id) {
    console.error('Specify either --email or --id');
    process.exit(2);
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    if (email) {
      const [result] = await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [hash, email]);
      console.log('Updated rows:', result.affectedRows);
    } else {
      const [result] = await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);
      console.log('Updated rows:', result.affectedRows);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();
