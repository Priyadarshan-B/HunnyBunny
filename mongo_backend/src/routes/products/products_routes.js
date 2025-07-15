const express = require("express");
const router = express.Router();
const multer = require("multer");
const products = require("../../controllers/products/qr_products");
const quantity = require("../../controllers/products/quantity");
const stocks = require("../../controllers/products/stocks");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/qr_products",
  upload.single("qr_image"),
  products.post_qr_products
);
router.get("/qr_products", products.get_qr_products);
router.post("/getProduct", products.get_product_by_code);
router.delete("/qr_products/:product_id", products.delete_qr_product);
router.put("/qr_products/:id", products.update_qr_product);

router.post("/update_stock", stocks.update_stock);

router.get("/qty", quantity.get_quantity);
module.exports = router;
