import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AddProduct from '../components/AddProduct';
import UpdateProduct from '../components/UpdateProduct';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState("All");
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(error => console.error('Error:', error));
    }, []);

    const handleDeleteClick = (product) => {
        setConfirmDelete(product);
    };

    const handleDeleteConfirmed = async () => {
        if (!confirmDelete) return;
        try {
            const response = await fetch(`http://localhost:5000/api/products/${confirmDelete._id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete product');
            setProducts(products.filter(product => product._id !== confirmDelete._id));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleProductAdded = (newProduct) => {
        setProducts([...products, newProduct]);
        setOpenAddModal(false);
    };

    const handleProductUpdated = (updatedProduct) => {
        setProducts(products.map(product => (product._id === updatedProduct._id ? updatedProduct : product)));
        setOpenEditModal(false);
    };

    const handleEditClick = (product) => {
        setSelectedProduct(product);
        setOpenEditModal(true);
    };

    // Determine stock color
    const getStockColor = (stock) => {
        if (stock < 5) return "red";
        if (stock >= 5 && stock <= 10) return "orange";
        return "green";
    };

    // Filter products based on search and category
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterCategory === "All" || product.category === filterCategory)
    );

    return (
        <Box>
            {/* Search and Filter */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <TextField
                    label="Search by Name"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2, width: { xs: "100%", sm: "250px" } }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <FormControl variant="outlined" sx={{ mb: 2, width: { xs: "100%", sm: "200px" } }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        label="Category"
                    >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Electronics">Electronics</MenuItem>
                        <MenuItem value="Furniture">Furniture</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() => setOpenAddModal(true)}
                    sx={{ mb: 2 }}
                >
                    Add Product
                </Button>
            </Box>

            {/* Add Product Modal */}
            <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add Product</DialogTitle>
                <DialogContent>
                    <AddProduct onProductAdded={handleProductAdded} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddModal(false)} color="secondary">Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Product Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Category</strong></TableCell>
                            <TableCell><strong>Price</strong></TableCell>
                            <TableCell><strong>Stock</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>${product.price}</TableCell>
                                    <TableCell>
                                        <Typography sx={{ color: getStockColor(product.stock), fontWeight: "bold" }}>
                                            {product.stock} {product.stock < 5 && "⚠️"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{product.description}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <IconButton onClick={() => handleEditClick(product)} color="warning">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteClick(product)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No products found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Update Product Modal */}
            <UpdateProduct product={selectedProduct} open={openEditModal} onClose={() => setOpenEditModal(false)} onProductUpdated={handleProductUpdated} />

            {/* Confirm Delete Dialog */}
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

export default ProductList;
