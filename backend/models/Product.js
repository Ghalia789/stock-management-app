const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 1 },
    price: { type: Number, required: true, min: 0 },
    category: { 
        type: String, 
        required: true, 
        enum: ['Electronics', 'Food', 'Other']
    },
    description: { type: String, default: '' },
    supplier: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Supplier',
        required: false
    },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;