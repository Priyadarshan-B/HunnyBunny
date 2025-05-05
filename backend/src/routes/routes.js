const productsRoutes = require('./products/products_routes');
const express = require('express');
const router = express.Router();

router.use('/products', productsRoutes);

module.exports = router;