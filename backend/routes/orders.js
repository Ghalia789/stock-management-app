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


router.get('/:id/pdf', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('supplier')
            .populate('products.productId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        console.log('Order products:', order.products); // Debug log

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=Purchase_Order_${order._id.toString().slice(-6)}.pdf`);
        
        doc.pipe(res);

        // ====================
        // HEADER SECTION
        // ====================
        // Company Logo
        doc.image('public/images/marketly_logo.png', 50, 45, { width: 50 })
           .fillColor('#333333')
           .fontSize(20)
           .text('Marketly', 110, 57)
           .fontSize(10)
           .text('123 Your Business Address', 200, 65, { align: 'right' })
           .text('City, State ZIP | Phone: (123) 456-7890', 200, 80, { align: 'right' })
           .moveDown();

        // Title
        doc.fontSize(18)
           .fillColor('#0066cc')
           .text('PURCHASE ORDER', 50, 120)
           .fontSize(12)
           .fillColor('#333333')
           .text(`PO Number: ${order._id.toString().slice(-6).toUpperCase()}`, 400, 120)
           .text(`Date: ${new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 400, 135);

        // ====================
        // BUYER/SUPPLIER INFO
        // ====================
        const buyerInfo = {
            x: 50,
            y: 170,
            width: 250,
            height: 80
        };

        const supplierInfo = {
            x: 300,
            y: 170,
            width: 250,
            height: 80
        };

        // Buyer Box (YOUR COMPANY)
        doc.rect(buyerInfo.x, buyerInfo.y, buyerInfo.width, buyerInfo.height)
           .stroke('#0066cc')
           .fontSize(11)
           .fillColor('#0066cc')
           .text('BUYER:', buyerInfo.x + 10, buyerInfo.y + 10)
           .fillColor('#000000')
           .font('Helvetica-Bold')
           .text('Marketly', buyerInfo.x + 10, buyerInfo.y + 25)
           .font('Helvetica')
           .text('123 Your Business Address', buyerInfo.x + 10, buyerInfo.y + 40)
           .text('City, State ZIP', buyerInfo.x + 10, buyerInfo.y + 55)
           .text('Tel: (123) 456-7890', buyerInfo.x + 10, buyerInfo.y + 70);

        // Supplier Box
        doc.rect(supplierInfo.x, supplierInfo.y, supplierInfo.width, supplierInfo.height)
           .stroke('#0066cc')
           .fontSize(11)
           .fillColor('#0066cc')
           .text('SUPPLIER:', supplierInfo.x + 10, supplierInfo.y + 10)
           .fillColor('#000000')
           .font('Helvetica-Bold')
           .text(order.supplier.name, supplierInfo.x + 10, supplierInfo.y + 25)
           .font('Helvetica')
           .text(order.supplier.address || 'Address not specified', supplierInfo.x + 10, supplierInfo.y + 40)
           .text(`Tel: ${order.supplier.phone || 'N/A'}`, supplierInfo.x + 10, supplierInfo.y + 55)
           .text(`Email: ${order.supplier.email || 'N/A'}`, supplierInfo.x + 10, supplierInfo.y + 70);

        // ====================
        // PRODUCTS TABLE (FIXED VERSION)
        // ====================
        const tableTop = 270;

        // 1. Draw table header
        doc.save()
           .rect(50, tableTop, 500, 20)
           .fill('#0066cc')
           .restore();

        doc.font('Helvetica-Bold')
           .fontSize(10)
           .fillColor('#ffffff')
           .text('#', 55, tableTop + 5)
           .text('DESCRIPTION', 80, tableTop + 5)
           .text('SKU', 300, tableTop + 5)
           .text('QTY', 370, tableTop + 5)
           .text('UNIT PRICE', 420, tableTop + 5)
           .text('TOTAL', 480, tableTop + 5);

        // 2. Draw product rows
        let y = tableTop + 20;
        
        if (order.products && order.products.length > 0) {
            order.products.forEach((item, index) => {
                const rowY = y + (index * 20);
                
                // Draw row background
                doc.save()
                   .rect(50, rowY, 500, 20)
                   .fill(index % 2 === 0 ? '#f5f5f5' : '#ffffff')
                   .restore();
                
                // Draw product text
                doc.font('Helvetica')
                   .fontSize(10)
                   .fillColor('#000000')
                   .text((index + 1).toString(), 55, rowY + 5)
                   .text(item.productId?.name || 'Product Not Found', 80, rowY + 5)
                   .text(item.quantityOrdered.toString(), 370, rowY + 5)
                   .text(`$${item.unitPrice.toFixed(2)}`, 420, rowY + 5)
                   .text(`$${(item.quantityOrdered * item.unitPrice).toFixed(2)}`, 480, rowY + 5);
            });

            // Draw table border
            doc.save()
               .rect(50, tableTop, 500, 20 + (order.products.length * 20))
               .stroke('#cccccc')
               .restore();

            // ====================
            // TOTALS SECTION (FIXED)
            // ====================
            const totalsY = y + (order.products.length * 20) + 20;
            
            doc.save()
               .rect(400, totalsY - 10, 150, 100)
               .fill('#ffffff')
               .stroke('#cccccc')
               .restore();
            
            doc.font('Helvetica-Bold')
               .fontSize(10)
               .fillColor('#000000')
               .text('SUBTOTAL:', 420, totalsY)
               .text(`$${order.totalCost.toFixed(2)}`, 480, totalsY)
               .text('TAX (0%):', 420, totalsY + 20)
               .text('$0.00', 480, totalsY + 20)
               .text('SHIPPING:', 420, totalsY + 40)
               .text('$0.00', 480, totalsY + 40)
               .fontSize(12)
               .text('TOTAL DUE:', 420, totalsY + 60)
               .text(`$${order.totalCost.toFixed(2)}`, 480, totalsY + 60);

            // ====================
            // FOOTER & SIGNATURES
            // ====================
            const footerY = totalsY + 100;
            
            doc.font('Helvetica')
               .fontSize(9)
               .fillColor('#000000')
               .text('Payment Terms: Net 30 days', 50, footerY)
               .text('Delivery Date: _________________________', 50, footerY + 15)
               .text('Shipping Method: _____________________', 50, footerY + 30);

            // Signature Lines
            doc.fontSize(10)
               .text('Authorized By:', 300, footerY)
               .moveTo(300, footerY + 20)
               .lineTo(450, footerY + 20)
               .stroke()
               .text('Name/Signature/Date', 300, footerY + 25)
               
               .text('Supplier Acknowledgment:', 300, footerY + 50)
               .moveTo(300, footerY + 70)
               .lineTo(450, footerY + 70)
               .stroke()
               .text('Name/Signature/Date', 300, footerY + 75);
        } else {
            // Handle case with no products
            doc.font('Helvetica')
               .fontSize(12)
               .fillColor('#ff0000')
               .text('NO PRODUCTS IN THIS ORDER', 50, y);
        }

        // Footer Note
        doc.fontSize(8)
           .fillColor('#666666')
           .text('This is an automatically generated purchase order. Please contact accounts payable for any questions.', 
                50, 750, { align: 'center', width: 500 });

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
