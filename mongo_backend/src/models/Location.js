const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    location: { type: String },
    status: { type: String, enum: ["0", "1"], default: "1" },

}, {
    timestamps: true
});

module.exports = mongoose.model('Location', LocationSchema);
