const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
    customer_name: { type: String, required: true },
    total_amount: { type: mongoose.Decimal128, required: true },
    payment_method: { type: String, enum: ['COD', 'CARD', 'UPI', 'CASH'], required: true },
    status: { type: String, enum: ['0', '1'], required: true }
}, {
    timestamps: true  // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Bill', BillSchema);
