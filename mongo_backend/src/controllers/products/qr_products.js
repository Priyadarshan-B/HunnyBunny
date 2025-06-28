const fs = require("fs");
const path = require("path");
const QRProduct = require("../../models/QRProduct");
const mongoose = require("mongoose");


exports.post_qr_products = async (req, res) => {
  try {
    const { product_id, name, price, quantity, location } = req.body;
    const qrImage = req.file;

    if (!product_id || !name || !price || !quantity || !location) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let qr_Path = "";
    if (qrImage) {
      const uploadDir = path.join(__dirname, "../../public/qr-codes");
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `${product_id}.png`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, qrImage.buffer);
      qr_Path = `qr-codes/${fileName}`;
    }

    const existing = await QRProduct.findOne({ product_name: name });

    if (existing) {
      const finalQRCode =
        existing.qr_code?.trim() !== "" ? existing.qr_code : qr_Path;

      existing.product_price = mongoose.Types.Decimal128.fromString(
        price.toString()
      );
      existing.product_quantity =
        existing.product_quantity + parseInt(quantity);
      existing.product_name = name;
      existing.qr_code = finalQRCode;

      await existing.save();

      return res
        .status(200)
        .json({ message: "Matching product updated successfully" });
    } else {
      const newProduct = new QRProduct({
        product_code: product_id,
        product_name: name,
        product_price: mongoose.Types.Decimal128.fromString(price.toString()),
        product_quantity: quantity,
        qr_code: qr_Path,
        location: location,
        status: "1",
      });

      await newProduct.save();

      return res
        .status(200)
        .json({ message: "New product inserted successfully" });
    }
  } catch (error) {
    console.error("Error processing QR product:", error);
    res.status(500).json({ error: "Failed to process QR product" });
  }
};

exports.get_qr_products = async (req, res) => {
  try {
    const { term, page, limit } = req.query;

    const filter = {
      status: "1",
      ...(term && {
        $or: [
          { product_name: { $regex: term, $options: "i" } },
          { product_code: { $regex: term, $options: "i" } },
        ],
      }),
    };

    let query = QRProduct.find(filter)
      .populate("location", "location")
      .select("_id product_code product_name product_price product_quantity qr_code location");

    const countPromise = QRProduct.countDocuments(filter);

    let parsedPage, parsedLimit;

    if (page && limit) {
      parsedPage = parseInt(page, 10);
      parsedLimit = Math.min(parseInt(limit, 10), 500);
      const skip = (parsedPage - 1) * parsedLimit;
      query = query.skip(skip).limit(parsedLimit);
    }

    const [products, totalCount] = await Promise.all([query, countPromise]);

    const mapped = products.map((p) => ({
      id: p._id,
      code: p.product_code,
      name: p.product_name,
      price: parseFloat(p.product_price?.toString()),
      product_quantity: p.product_quantity,
      qr_code: p.qr_code,
      location_id: p.location?._id || null,
      location_name: p.location?.location || null,
    }));

    res.status(200).json({
      data: mapped,
      total: totalCount,
      ...(page && limit
        ? {
            page: parsedPage,
            pageSize: parsedLimit,
            totalPages: Math.ceil(totalCount / parsedLimit),
          }
        : {}),
    });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};


exports.get_product_by_code = async (req, res) => {
  try {
    const { code, location } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Product code is required" });
    }

    const filter = {
      product_code: code,
      status: "1",
      ...(location && location !== "All" && { location }),
    };

    const product = await QRProduct.findOne(filter);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      code: product.product_code,
      name: product.product_name,
      price: parseFloat(product.product_price?.toString()),
    });
  } catch (error) {
    console.error("Error fetching product by code:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

exports.delete_qr_product = async (req, res) => {
  try {
    const { product_id } = req.params;

    if (!product_id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const product = await QRProduct.findById(product_id);
    console.log(product)
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.qr_code) {
      const filePath = path.join(__dirname, "../../public", product.qr_code);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await QRProduct.deleteOne({ _id: product_id });

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ error: "Failed to delete product" });
  }
};