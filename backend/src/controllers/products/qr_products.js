const {post_database } = require("../../config/db_utils");

exports.post_qr_products = async (req, res) => {
    try {
        const { product_id, name, price, quantity } = req.body;
        const qrImage = req.file;

        if (!product_id || !name || !price || !quantity || !qrImage) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const query = `INSERT INTO qr_products (product_code, product_name, product_price, product_quantity, qr_code) VALUES (?, ?, ?, ?, ?)`;
        const params = [product_id, name, price, quantity, qrImage.buffer]; 
        const result = await post_database(query, params);

        res.status(200).json({ message: "Product saved", result });
    } catch (error) {
        console.error("Error inserting QR products:", error);
        res.status(500).json({ error: "Failed to insert QR product" });
    }
}
