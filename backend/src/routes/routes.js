const productsRoutes = require('./products/products_routes');
const authRoutes = require('./auth/auth_routes');
const { authenticateToken } = require('../middleware/auth')
const express = require('express');
const router = express.Router();

router.use('/auth', authRoutes);

router.use(authenticateToken);
router.use('/products', productsRoutes);

module.exports = router;