const mongoose = require('mongoose');

const QRProductSchema = new mongoose.Schema({
    product_code: { type: String, required: true },
    product_name: { type: String, required: true },
    product_price: { type: mongoose.Decimal128, required: true },
    product_quantity: { type: Number, required: true },
    qr_code: { type: String, required: true },
    status: { type: String, enum: ['0', '1'], default: '1' }
}, {
    timestamps: true  // <-- This adds createdAt and updatedAt fields
});

module.exports = mongoose.model('QRProduct', QRProductSchema);
