const fs = require("fs");
const path = require("path");
const QRProduct = require("../../models/QRProduct");

exports.post_qr_products = async (req, res) => {
    try {
        const { product_id, name, price, quantity } = req.body;
        const qrImage = req.file;

        if (!product_id || !name || !price || !quantity) {
            return res.status(400).json({ error: "All fields are required" });
        }

        let qr_Path = "";
        if (qrImage) {
            const uploadDir = path.join(__dirname, "../../public/qr-codes");
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const fileName = `${product_id}.png`;
            const filePath = path.join(uploadDir, fileName);

            fs.writeFileSync(filePath, qrImage.buffer);
            qr_Path = `qr-codes/${fileName}`;
        }

        const existing = await QRProduct.findOne({ product_name: name });

        if (existing) {
            const finalQRCode = existing.qr_code?.trim() !== "" ? existing.qr_code : qr_Path;

            existing.product_price = price;
            existing.product_quantity = existing.product_quantity + parseInt(quantity);
            existing.product_name = name;
            existing.qr_code = finalQRCode;

            await existing.save();

            return res.status(200).json({ message: "Matching product updated successfully" });
        } else {
            const newProduct = new QRProduct({
                product_code: product_id,
                product_name: name,
                product_price: price,
                product_quantity: quantity,
                qr_code: qr_Path,
                status: '1'
            });

            await newProduct.save();

            return res.status(200).json({ message: "New product inserted successfully" });
        }
    } catch (error) {
        console.error("Error processing QR product:", error);
        res.status(500).json({ error: "Failed to process QR product" });
    }
};

exports.get_qr_products = async (req, res) => {
    try {
        const { term } = req.query;

        const filter = {
            status: '1',
            ...(term && {
                $or: [
                    { product_name: { $regex: term, $options: 'i' } },
                    { product_code: { $regex: term, $options: 'i' } }
                ]
            })
        };

        const products = await QRProduct.find(filter, {
            _id: 1,
            product_code: 1,
            product_name: 1,
            product_price: 1,
            product_quantity: 1,
            qr_code: 1
        });

        const mapped = products.map(p => ({
            id: p._id,
            code: p.product_code,
            name: p.product_name,
            price: parseFloat(p.product_price?.toString()),
            product_quantity: p.product_quantity,
            qr_code: p.qr_code
        }));

        res.status(200).json(mapped);
    } catch (error) {
        console.error("DB Error:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

exports.get_product_by_code = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: "Product code is required" });
        }

        const product = await QRProduct.findOne({ product_code: code, status: '1' });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({
            code: product.product_code,
            name: product.product_name,
            price: product.product_price
        });
    } catch (error) {
        console.error("Error fetching product by code:", error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};
