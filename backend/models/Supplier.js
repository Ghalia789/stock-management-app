const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactInfo: { type: String }, // General contact info (optional)
    email: {
        type: String,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        sparse: true, // Allows some suppliers to not have emails
    },
    phone: {
        type: String,
        match: [/^\+?\d{7,15}$/, "Invalid phone number format"],
        sparse: true,
    },
    address: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Supplier', supplierSchema);
