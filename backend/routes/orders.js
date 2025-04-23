const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// API to place an order
router.post('/', async (req, res) => {
    try {
        console.log('Incoming order request:', req.body);
        
        const { supplier, products, orderedBy } = req.body;

        // Validate required fields
        if (!supplier || !products || !orderedBy) {
            return res.status(400).json({ 
                message: 'Missing required fields: supplier, products, or orderedBy' 
            });
        }

        // Validate supplier exists
        const supplierExists = await Supplier.findById(supplier);
        if (!supplierExists) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // Validate products array
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Products must be a non-empty array' });
        }

        // Validate each product
        for (const item of products) {
            if (!item.productId || !item.quantityOrdered || !item.unitPrice) {
                return res.status(400).json({ 
                    message: 'Each product must have productId, quantityOrdered, and unitPrice'
                });
            }

            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ 
                    message: `Product with ID ${item.productId} not found`
                });
            }

            if (product.supplier.toString() !== supplier) {
                return res.status(400).json({ 
                    message: `Product ${product.name} does not belong to supplier ${supplier}`,
                    productId: item.productId
                });
            }
        }

        // Create the order
        const newOrder = new Order({
            supplier,
            products,
            orderedBy,
            status: 'Pending',
            isAutoOrder: false
        });

        // The pre-save hook will calculate totalCost automatically
        const savedOrder = await newOrder.save();
        
        console.log('Order created successfully:', savedOrder);
        res.status(201).json({ 
            message: 'Order placed successfully', 
            order: savedOrder 
        });

    } catch (error) {
        console.error('Order creation error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation error', 
                errors 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error creating order', 
            error: error.message 
        });
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
            .populate('products.productId');

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
// by adding to existing stock
const updateBulkStock = async (products) => {
    try {
        const results = [];

        for (const product of products) {
            const existingProduct = await Product.findById(product.id);

            if (!existingProduct) {
                results.push({ id: product.id, success: false, message: 'Product not found' });
                continue;
            }

            const newStock = existingProduct.stock + product.stock;

            const updatedProduct = await Product.findByIdAndUpdate(
                product.id,
                { stock: newStock },
                { new: true }
            );

            results.push({
                id: product.id,
                success: true,
                name: updatedProduct.name,
                newStock: updatedProduct.stock
            });
        }

        return { success: true, results };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error updating stock' };
    }
};


// Function to print order
router.get('/:id/pdf', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('supplier')
            .populate('products.productId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        console.log("📦 PDF route triggered for order:", req.params.id);

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=order_${order._id}.pdf`);
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Build PDF content
        doc.fontSize(20).text(`Order #${order._id}`, { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12).text(`Date: ${order.orderDate.toLocaleDateString()}`);
        doc.text(`Status: ${order.status}`);
        doc.text(`Supplier: ${order.supplier.name}`);
        doc.moveDown();
        
        // Products table
        const tableTop = doc.y;
        let tableY = tableTop;
        
        doc.font('Helvetica-Bold');
        doc.text('Product', 50, tableY);
        doc.text('Qty', 250, tableY);
        doc.text('Price', 300, tableY);
        doc.text('Total', 350, tableY);
        doc.font('Helvetica');
        
        tableY += 25;
        
        order.products.forEach(item => {
            doc.text(item.productId.name, 50, tableY);
            doc.text(item.quantityOrdered.toString(), 250, tableY);
            doc.text(`$${item.unitPrice.toFixed(2)}`, 300, tableY);
            doc.text(`$${(item.quantityOrdered * item.unitPrice).toFixed(2)}`, 350, tableY);
            tableY += 20;
        });
        
        // Total
        tableY += 10;
        doc.font('Helvetica-Bold');
        doc.text('Subtotal:', 300, tableY);
        doc.text(`$${order.totalCost.toFixed(2)}`, 350, tableY);
        
        doc.end();
        
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ 
            message: 'Error generating PDF', 
            error: error.message 
        });
    }
});

module.exports = router;
