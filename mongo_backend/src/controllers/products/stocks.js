const QRProduct = require("../../models/QRProduct");

exports.update_stock = async (product_name, product_quantity) => {
    if (!product_name || !product_quantity) {
        throw new Error("All fields are required");
    }

    const product = await QRProduct.findOne({ product_name, status: '1' });

    if (!product) {
        throw new Error(`Product not found: ${product_name}`);
    }

    const existingQuantity = parseInt(product.product_quantity);
    const newQuantity = existingQuantity - parseInt(product_quantity);

    if (newQuantity < 0) {
        throw new Error(`Insufficient stock for product: ${product_name}`);
    }

    product.product_quantity = newQuantity;
    await product.save();

    return { message: "Stock updated successfully" };
};
