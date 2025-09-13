// routes/products.js
const express = require('express');
const router = express.Router();
const { getProducts } = require('../sales');

router.get('/', async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

module.exports = router;
