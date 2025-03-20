const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // Core fields from your checklist
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantityOrdered: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Ordered', 'Received'],
        default: 'Pending'
    },

    // Additional useful fields
    orderDate: {
        type: Date,
        default: Date.now
    },
    expectedDeliveryDate: {
        type: Date
    },
    orderedBy: {
        type: String,
        required: true
    },

    // For tracking automatic ordering for low-stock items
    isAutoOrder: {
        type: Boolean,
        default: false
    },

    // Financial tracking
    unitPrice: {
        type: Number,
        min: 0
    },
    totalCost: {
        type: Number,
        min: 0
    }
});

// Calculate total cost before saving
orderSchema.pre('save', function (next) {
    if (this.unitPrice && this.quantityOrdered) {
        this.totalCost = this.unitPrice * this.quantityOrdered;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;