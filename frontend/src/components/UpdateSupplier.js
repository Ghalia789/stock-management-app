import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const UpdateSupplier = ({ supplier, open, onClose, onSupplierUpdated }) => {
    const [formData, setFormData] = useState({
        name: '',
        contactInfo: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name || '',
                contactInfo: supplier.contactInfo || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || ''
            });
        }
    }, [supplier]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/suppliers/${supplier._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to update supplier');

            const updatedSupplier = await response.json();
            onSupplierUpdated(updatedSupplier);
            onClose(); // Close the modal after update
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogContent>
                <Container maxWidth="sm">
                    <Box sx={{ p: 2 }}>
                        <form onSubmit={handleSubmit}>
                            <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} required sx={{ mb: 2 }} />
                            <TextField fullWidth label="General Contact Info" name="contactInfo" value={formData.contactInfo} onChange={handleChange} sx={{ mb: 2 }} />
                            <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} sx={{ mb: 2 }} />
                            <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} sx={{ mb: 2 }} />
                            <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} required sx={{ mb: 2 }} />
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

export default UpdateSupplier;
