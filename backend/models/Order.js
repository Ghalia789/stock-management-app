const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products: [
        {
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
            unitPrice: {
                type: Number,
                min: 0,
                required: true
            }
        }
    ],
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: false // Not all orders need a supplier
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Ordered', 'Received'],
        default: 'Pending'
    },
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
    isAutoOrder: {
        type: Boolean,
        default: false
    },
    totalCost: {
        type: Number,
        min: 0
    }
}, { timestamps: true });

// Automatically calculate total order cost before saving
orderSchema.pre('save', function (next) {
    this.totalCost = this.products.reduce((sum, item) => sum + (item.unitPrice * item.quantityOrdered), 0);
    next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
