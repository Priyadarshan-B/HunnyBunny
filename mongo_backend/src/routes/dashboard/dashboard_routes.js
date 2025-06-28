const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/dashboard/dashboard');

router.get('/tdy-products', dashboardController.tdy_sold);
router.get('/stats', dashboardController.total_products)
module.exports = router;
