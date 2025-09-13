// routes/buy.js
const express = require('express');
const router = express.Router();
const { buyCoffee } = require('../sales');

router.post('/', async (req, res) => {
  const { user_id, product_sku, quantity } = req.body;

  try {
    const result = await buyCoffee(user_id, product_sku, quantity);

    // Convert BigInt to Number safely
    const serializedResult = {
      ...result,
      saleID: Number(result.saleID),   // <--- convert BigInt
      user_id: Number(result.user_id)
    };

    res.json({ message: 'Purchase successful!', ...serializedResult });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
