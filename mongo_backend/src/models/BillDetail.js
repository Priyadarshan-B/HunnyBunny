// models/BillDetail.js
const mongoose = require('mongoose');

const BillDetailSchema = new mongoose.Schema({
    bill_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
    product_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: mongoose.Decimal128, default: 0.0 },
    total_price: { type: mongoose.Decimal128, default: 0.0 },
    status: { type: String, enum: ['0', '1'], default: '1' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BillDetail', BillDetailSchema);
