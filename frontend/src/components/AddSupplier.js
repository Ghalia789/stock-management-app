import React, { useState } from 'react';
import { TextField, Button, Container, Box } from '@mui/material';

const AddSupplier = ({ onSupplierAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        contactInfo: '',
        email: '',
        phone: '',
        address: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Failed to add supplier');
            const newSupplier = await response.json();
            onSupplierAdded(newSupplier);
            setFormData({ name: '', contactInfo: '', email: '', phone: '', address: '' });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
                <form onSubmit={handleSubmit}>
                    <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} required sx={{ mb: 2 }} />
                    <TextField fullWidth label="General Contact Info" name="contactInfo" value={formData.contactInfo} onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} required sx={{ mb: 2 }} />
                    <Button variant="contained" color="primary" type="submit">Add Supplier</Button>
                </form>
            </Box>
        </Container>
    );
};

export default AddSupplier;
