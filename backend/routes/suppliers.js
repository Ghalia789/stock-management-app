const express = require('express');
const Supplier = require('../models/Supplier');
const router = express.Router();

// Create Supplier
router.post('/', async (req, res) => {
    try {
        const { name, contactInfo, email, phone, address } = req.body;
        const supplier = new Supplier({ name, contactInfo, email, phone, address });
        await supplier.save();
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get All Suppliers
router.get('/', async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Supplier by ID
router.get('/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Supplier
router.put('/:id', async (req, res) => {
    try {
        const { name, contactInfo, email, phone, address } = req.body;
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            { name, contactInfo, email, phone, address },
            { new: true, runValidators: true }
        );
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json(supplier);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete Supplier
router.delete('/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
