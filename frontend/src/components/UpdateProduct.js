import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';

const UpdateProduct = ({ product, open, onClose, onProductUpdated }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        description: ''
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                category: product.category || '',
                price: product.price || '',
                stock: product.stock || '',
                description: product.description || ''
            });
        }
    }, [product]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Convert string values to numbers where needed
        const dataToSend = {
            ...formData,
            stock: Number(formData.stock),
            price: Number(formData.price),
            lowStockThreshold: formData.lowStockThreshold ? Number(formData.lowStockThreshold) : undefined
        };
        
        try {
            const response = await axios.put(`/api/products/${product._id}`, dataToSend);
            onProductUpdated(response.data);
            onClose();
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Product</DialogTitle>
            <DialogContent>
                <Container maxWidth="sm">
                    <Box sx={{ p: 2 }}>
                        <form onSubmit={handleSubmit}>
                            <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} required sx={{ mb: 2 }} />
                            <TextField fullWidth label="Category" name="category" value={formData.category} onChange={handleChange} required sx={{ mb: 2 }} />
                            <TextField fullWidth label="Price" name="price" type="number" value={formData.price} onChange={handleChange} required sx={{ mb: 2 }} />
                            <TextField fullWidth label="Quantity" name="stock" type="number" value={formData.stock} onChange={handleChange} required sx={{ mb: 2 }} />
                            <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} required sx={{ mb: 2 }} />
                        </form>
                    </Box>
                </Container>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Cancel</Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">Update</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateProduct;
