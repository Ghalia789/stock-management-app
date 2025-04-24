const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// 1. Total Stock Overview
router.get('/stock-overview', async (req, res) => {
    try {
        const products = await Product.find();
        const totalProducts = products.length;
        const totalQuantity = products.reduce((acc, item) => acc + item.quantity, 0);

        res.json({ totalProducts, totalQuantity });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Inventory Value Calculation
router.get('/inventory-value', async (req, res) => {
    try {
        const products = await Product.find();
        const totalValue = products.reduce((acc, item) => acc + item.price * item.quantity, 0);

        res.json({ totalValue });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. Stock Movements by Period
router.get('/stock-movements', async (req, res) => {
    const { period } = req.query;

    let startDate;
    const now = new Date();

    if (period === 'daily') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'weekly') {
        startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'monthly') {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else {
        return res.status(400).json({ message: 'Invalid period (use daily, weekly, or monthly)' });
    }

    try {
        const movements = await StockMovement.find({ date: { $gte: startDate } }).populate('productId');
        res.json({ count: movements.length, movements });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Inventory Report
router.get('/inventory-report', async (req, res) => {
    try {
        const products = await Product.find();

        const report = products.map(product => ({
            name: product.name,
            quantity: product.quantity,
            price: product.price,
            totalValue: product.quantity * product.price
        }));

        res.json({ report });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. Export Inventory Data as CSV
router.get('/export/csv', async (req, res) => {
    try {
        const products = await Product.find();

        const exportData = products.map(product => ({
            Name: product.name,
            Price: product.price,
            Quantity: product.stock,
            TotalValue: product.price * product.stock
        }));

        const parser = new Parser();
        const csv = parser.parse(exportData);

        res.header('Content-Type', 'text/csv');
        res.attachment('inventory.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// 6. Export Inventory Data as PDF
router.get('/export/pdf', async (req, res) => {
    try {
        const products = await Product.find();

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory.pdf');
        doc.pipe(res);

        doc.fontSize(18).text('Inventory Report', { align: 'center' });
        doc.moveDown();

        products.forEach((product, index) => {
            doc
                .fontSize(12)
                .text(`${index + 1}. ${product.name}`)
                .text(`   Price: $${product.price}`)
                .text(`   Quantity: ${product.stock}`)
                .text(`   Total Value: $${product.price * product.stock}`)
                .moveDown();
        });

        doc.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// 7. Export Inventory Data as Excel 
router.get('/export/excel', async (req, res) => {
    try {
        const products = await Product.find();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventory');

        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Price', key: 'price', width: 15 },
            { header: 'Quantity', key: 'stock', width: 15 },
            { header: 'Total Value', key: 'totalValue', width: 20 },
        ];

        products.forEach(product => {
            worksheet.addRow({
                name: product.name,
                price: product.price,
                quantity: product.stock,
                totalValue: product.price * product.stock,
            });
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', 'attachment; filename=inventory.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;