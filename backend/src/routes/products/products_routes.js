const express = require('express');
const router = express.Router();
const multer = require('multer');
const products = require("../../controllers/products/qr_products");

const storage = multer.memoryStorage(); 
const upload = multer({ storage });

router.post('/qr_products', upload.single('qr_image'), products.post_qr_products);

module.exports = router;