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
        required: true // Not all orders need a supplier
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
orderSchema.methods.toPrintFormat = function() {
    return {
        orderId: this._id,
        orderDate: this.orderDate.toLocaleDateString(),
        status: this.status,
        supplier: this.supplier, // This will be populated
        products: this.products.map(item => ({
            name: item.productId?.name || 'Product not found', // Product will be populated
            quantity: item.quantityOrdered,
            unitPrice: item.unitPrice,
            total: item.quantityOrdered * item.unitPrice
        })),
        subtotal: this.totalCost,
        orderedBy: this.orderedBy,
        expectedDelivery: this.expectedDeliveryDate?.toLocaleDateString() || 'Not specified'
    };
};
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
