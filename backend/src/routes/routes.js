const productsRoutes = require('./products/products_routes');
const authRoutes = require('./auth/auth_routes');
const express = require('express');
const router = express.Router();

router.use('/products', productsRoutes);
router.use('/auth', authRoutes);

module.exports = router;