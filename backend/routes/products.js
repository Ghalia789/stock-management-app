const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Create a new product
router.post('/', async (req, res) => {
    try {
        const { name, stock, price, category, description} = req.body;
        const newProduct = new Product({ name, stock, price, category, description});
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error adding product', error });
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('supplier', 'name email phone');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('supplier');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
});

// Update a product
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
});

// Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
});

// Check stock availability
router.get('/:id/stock', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        const isAvailable = product.stock > 0;
        res.json({ 
            productId: product._id,
            name: product.name,
            inStock: isAvailable,
            stockCount: product.stock,
            isLowStock: product.stock < product.lowStockThreshold,
            threshold: product.lowStockThreshold
        });
    } catch (error) {
        res.status(500).json({ message: 'Error checking stock', error });
    }
});

// Bulk stock update
router.patch('/stock/bulk', async (req, res) => {
    try {
        const updates = req.body; // Expect format: [{id: "...", stock: 10}, {...}]
        
        if (!Array.isArray(updates)) {
            return res.status(400).json({ message: 'Invalid format. Expected array of updates' });
        }
        
        const results = [];
        
        for (const update of updates) {
            if (!update.id || update.stock === undefined) {
                results.push({ id: update.id, success: false, message: 'Missing id or stock value' });
                continue;
            }
            
            try {
                const product = await Product.findByIdAndUpdate(
                    update.id,
                    { stock: update.stock },
                    { new: true }
                );
                
                if (!product) {
                    results.push({ id: update.id, success: false, message: 'Product not found' });
                } else {
                    results.push({ 
                        id: update.id, 
                        success: true, 
                        name: product.name,
                        newStock: product.stock 
                    });
                }
            } catch (err) {
                results.push({ id: update.id, success: false, message: err.message });
            }
        }
        
        res.json({ results });
    } catch (error) {
        res.status(500).json({ message: 'Error updating stocks', error });
    }
});

module.exports = router;
