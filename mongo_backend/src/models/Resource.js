// models/Resource.js
const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    icon: { type: String, required: true },
    order_by: { type: Number, required: true },
    status: { type: String, enum: ['0', '1'], default: '1' }
});

module.exports = mongoose.model('Resource', ResourceSchema);
