const jwt = require('jsonwebtoken');
require('dotenv').config();

// Admin user data (from schema.sql)
const adminUser = {
  id: 2,
  username: 'lepasana@gmail.com',
  role: 'admin'
};

const token = jwt.sign(adminUser, process.env.JWT_SECRET, { expiresIn: '30d' });
console.log('Admin Token:', token);