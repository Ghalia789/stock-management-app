import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AddSupplier from '../components/AddSupplier';
import UpdateSupplier from '../components/UpdateSupplier';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const SupplierList = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/suppliers')
            .then(res => res.json())
            .then(data => setSuppliers(data))
            .catch(error => console.error('Error:', error));
    }, []);

    const handleDeleteClick = (supplier) => {
        setConfirmDelete(supplier);
    };

    const handleDeleteConfirmed = async () => {
        if (!confirmDelete) return;
        try {
            const response = await fetch(`http://localhost:5000/api/suppliers/${confirmDelete._id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete supplier');
            setSuppliers(suppliers.filter(supplier => supplier._id !== confirmDelete._id));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleSupplierAdded = (newSupplier) => {
        setSuppliers([...suppliers, newSupplier]);
        setOpenAddModal(false);
    };

    const handleSupplierUpdated = (updatedSupplier) => {
        setSuppliers(suppliers.map(supplier => (supplier._id === updatedSupplier._id ? updatedSupplier : supplier)));
        setOpenEditModal(false);
    };

    const handleEditClick = (supplier) => {
        setSelectedSupplier(supplier);
        setOpenEditModal(true);
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "right", mb: 2 }}>
                <TextField
                    label="Search by Name"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2, width: { xs: "100%", sm: "300px" } }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<GroupAddIcon />}
                    onClick={() => setOpenAddModal(true)}
                    sx={{ mb: 2 }}
                >
                    Add Supplier
                </Button>
            </Box>

            <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add Supplier</DialogTitle>
                <DialogContent>
                    <AddSupplier onSupplierAdded={handleSupplierAdded} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddModal(false)} color="secondary">Cancel</Button>
                </DialogActions>
            </Dialog>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Contact Info</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredSuppliers.length > 0 ? (
                            filteredSuppliers.map((supplier) => (
                                <TableRow key={supplier._id}>
                                    <TableCell>{supplier.name}</TableCell>
                                    <TableCell>{supplier.contactInfo}</TableCell>
                                    <TableCell>{supplier.email}</TableCell>
                                    <TableCell>{supplier.phone}</TableCell>
                                    <TableCell>{supplier.address}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <IconButton onClick={() => handleEditClick(supplier)} color="warning">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteClick(supplier)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No suppliers found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <UpdateSupplier supplier={selectedSupplier} open={openEditModal} onClose={() => setOpenEditModal(false)} onSupplierUpdated={handleSupplierUpdated} />

            <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete {confirmDelete?.name}?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDelete(null)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirmed} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default SupplierList;
