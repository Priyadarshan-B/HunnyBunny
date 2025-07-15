const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: String, required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Contact', ContactSchema); 