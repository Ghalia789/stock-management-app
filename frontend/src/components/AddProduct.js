import React, { useState } from 'react';
import { TextField, Button, Container, Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';

const AddProduct = ({ onProductAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Electronics',
        price: '',
        stock: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Convert string values to numbers for price and stock
        const dataToSend = {
            ...formData,
            price: formData.price ? Number(formData.price) : 0,
            stock: formData.stock ? Number(formData.stock) : 0
        };
        
        try {
            const response = await axios.post('http://localhost:5000/api/products/', dataToSend, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            // Axios automatically throws errors for non-2xx responses,
            // so if we get here, the request was successful
            const newProduct = response.data;
            onProductAdded(newProduct);
            setFormData({ name: '', category: 'Electronics', price: '', stock: '', description: '' });
        } catch (error) {
            // Axios provides better error details
            if (error.response) {
                // The server responded with a status code outside the 2xx range
                console.error('Server error details:', error.response.data);
                console.error(`Failed to add product: ${error.response.status}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
            } else {
                // Something happened in setting up the request
                console.error('Error:', error.message);
            }
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
                <form onSubmit={handleSubmit}>
                    <TextField 
                        fullWidth 
                        label="Product Name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        sx={{ mb: 2 }} 
                    />
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            name="category"
                            value={formData.category}
                            label="Category"
                            onChange={handleChange}
                            required
                        >
                            <MenuItem value="Electronics">Electronics</MenuItem>
                            <MenuItem value="Food">Food</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <TextField 
                        fullWidth 
                        label="Price" 
                        name="price" 
                        type="number" 
                        value={formData.price} 
                        onChange={handleChange} 
                        required 
                        sx={{ mb: 2 }} 
                    />
                    
                    <TextField 
                        fullWidth 
                        label="Stock" 
                        name="stock" 
                        type="number" 
                        value={formData.stock} 
                        onChange={handleChange} 
                        required 
                        sx={{ mb: 2 }} 
                    />
                    
                    <TextField 
                        fullWidth 
                        label="Description" 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        multiline 
                        rows={3} 
                        sx={{ mb: 2 }} 
                    />
                    
                    <Button variant="contained" color="primary" type="submit">
                        Add Product
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default AddProduct;
