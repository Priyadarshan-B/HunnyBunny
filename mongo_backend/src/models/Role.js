const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    role: { type: String, required: true },
    resources: { type: [String], required: true }, 
    status: { type: String, enum: ['0', '1'], default: '1' }
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Role', RoleSchema);
