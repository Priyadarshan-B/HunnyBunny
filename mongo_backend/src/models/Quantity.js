// models/Quantity.js
const mongoose = require('mongoose');

const QuantitySchema = new mongoose.Schema({
    quantity: { type: String, required: true },
    expansion: { type: String, required: true },
    status: { type: String, enum: ['0', '1'], default: '1' }
});

module.exports = mongoose.model('Quantity', QuantitySchema);
