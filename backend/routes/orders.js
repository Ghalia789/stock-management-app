const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// API to place an order for low-stock items with the same supplier
router.post('/', async (req, res) => {
    try {
        const { supplierId, products } = req.body;

        // Validate supplier
        const supplierExists = await Supplier.findById(supplierId);
        if (!supplierExists) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // Validate products
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Products list is required' });
        }

        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
            }
            if (product.supplier.toString() !== supplierId) {
                return res.status(400).json({ message: `Product ${product.name} does not belong to supplier ${supplierId}` });
            }
        }

        // Create the order
        const newOrder = new Order({
            supplier: supplierId,
            products,
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newOrder.save();
        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error placing order', error });
    }
});

// API to view pending & completed orders
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;

        // Optional status filter
        const filter = status ? { status } : {};

        const orders = await Order.find(filter)
            .populate('supplier', 'name email phone')
            .populate('products._id', 'name stock price');

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
});

// API to update order status (Pending → Ordered → Received)
router.put('/status', async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const validStatuses = ['Pending', 'Ordered', 'Received'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const order = await Order.findById(orderId).populate('products.productId');
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        // If the status is updated to "Received", update the stock of the products
        if (status === 'Received') {
            const productsToUpdate = order.products.map(product => ({
                id: product.productId._id, 
                stock: product.productId.stock + product.quantityOrdered
            }));

            const result = await updateBulkStock(productsToUpdate);
            if (!result.success) {
                return res.status(500).json({ message: 'Error updating product stock.' });
            }
        }

        // Update order status and updatedAt timestamp
        order.status = status;
        order.updatedAt = new Date();
        await order.save();

        res.status(200).json({ message: 'Order status updated successfully.', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating order status', error });
    }
});

// Function to update bulk stock
const updateBulkStock = async (products) => {
    try {
        const results = [];

        for (const product of products) {
            const updatedProduct = await Product.findByIdAndUpdate(
                product.id,
                { stock: product.stock },
                { new: true }
            );

            if (!updatedProduct) {
                results.push({ id: product.id, success: false, message: 'Product not found' });
            } else {
                results.push({ 
                    id: product.id, 
                    success: true, 
                    name: updatedProduct.name,
                    newStock: updatedProduct.stock 
                });
            }
        }

        return { success: true, results };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error updating stock' };
    }
};

module.exports = router;
