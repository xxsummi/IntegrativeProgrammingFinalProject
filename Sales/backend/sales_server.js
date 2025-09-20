const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/buy', require('./routes/buy'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
