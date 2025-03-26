import React, { useState, useEffect } from 'react'; 
import { TextField, Button, Container, Box, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';

const UpdateProduct = ({ product, open, onClose, onProductUpdated }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        description: '',
        supplierId: ''  // Add supplierId to the form data
    });

    const [suppliers, setSuppliers] = useState([]); // To store supplier list

    useEffect(() => {
        // Fetch suppliers data when the component mounts
        fetch('http://localhost:5000/api/suppliers')
            .then((res) => res.json())
            .then((data) => setSuppliers(data))
            .catch((error) => console.error('Error fetching suppliers:', error));

        if (product) {
            setFormData({
                name: product.name || '',
                category: product.category || '',
                price: product.price || '',
                stock: product.stock || '',
                description: product.description || '',
                supplierId: product.supplier || ''  // Pre-fill the supplierId from the product
            });
        }
    }, [product]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare the data to send (including supplierId)
        const dataToSend = {
            ...formData,
            stock: Number(formData.stock),
            price: Number(formData.price),
            lowStockThreshold: formData.lowStockThreshold ? Number(formData.lowStockThreshold) : undefined
        };

        try {
            // Make the update request to the backend
            const response = await axios.put(`/api/products/${product._id}`, dataToSend);
            onProductUpdated(response.data);  // Call onProductUpdated after successful update
            onClose();  // Close the dialog
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
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Supplier</InputLabel>
                                <Select
                                    name="supplierId"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="">Select Supplier</MenuItem>
                                    {suppliers.map((supplier) => (
                                        <MenuItem key={supplier._id} value={supplier._id}>
                                            {supplier.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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
