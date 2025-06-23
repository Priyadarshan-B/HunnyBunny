const productsRoutes = require("./products/products_routes");
const authRoutes = require("./auth/auth_routes");
const billsRoutes = require("./bills/bill_routes");
const dashboardRoutes = require("./dashboard/dashboard_routes");
const { authenticateToken } = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.use("/auth", authRoutes);

// router.use(authenticateToken);
router.use("/products", productsRoutes);
router.use("/bills", billsRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
