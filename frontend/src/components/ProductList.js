import React, { useEffect, useState } from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, Button, TextField, Box, Dialog, DialogTitle, DialogContent, 
    DialogActions, IconButton, Select, MenuItem, FormControl, InputLabel, 
    Typography, Collapse 
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AddProduct from '../components/AddProduct';
import UpdateProduct from '../components/UpdateProduct';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState("All");
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [expandedProductId, setExpandedProductId] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(error => console.error('Error:', error));

        fetch('http://localhost:5000/api/suppliers')
            .then(res => res.json())
            .then(data => setSuppliers(data))
            .catch(error => console.error('Error fetching suppliers:', error));
    }, []);

    const handleToggleExpand = (productId) => {
        setExpandedProductId(expandedProductId === productId ? null : productId);
    };

    const getSupplierName = (supplierId) => {
        const supplier = suppliers.find(s => s._id === supplierId);
        return supplier ? supplier.name : "Unknown Supplier";
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterCategory === "All" || product.category === filterCategory)
    );

    return (
        <Box>
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
                        <MenuItem value="Food">Food</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
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

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Category</strong></TableCell>
                            <TableCell><strong>Price</strong></TableCell>
                            <TableCell><strong>Stock</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <React.Fragment key={product._id}>
                                    {/* Main row */}
                                    <TableRow>
                                        <TableCell sx={{ width: "50px", padding: "8px" }}>
                                            <IconButton 
                                                onClick={() => handleToggleExpand(product._id)}
                                                size="small"
                                            >
                                                {expandedProductId === product._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>${product.price}</TableCell>
                                        <TableCell>
                                            <Typography sx={{ 
                                                fontWeight: "bold", 
                                                color: product.stock < 5 ? "red" : product.stock < 10 ? "orange" : "green" 
                                            }}>
                                                {product.stock} {product.stock < 5 && "⚠️"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: "flex", gap: 1 }}>
                                                <IconButton onClick={() => setSelectedProduct(product) || setOpenEditModal(true)} color="warning">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton onClick={() => setConfirmDelete(product)} color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>

                                    {/* Expandable row */}
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ padding: 0 }}>
                                            <Collapse in={expandedProductId === product._id} timeout="auto" unmountOnExit>
                                                <Box sx={{ padding: 2, backgroundColor: "#f9f9f9", borderTop: "1px solid #ddd" }}>
                                                    <Typography variant="body1"><strong>Description:</strong> {product.description}</Typography>
                                                    <Typography variant="body1"><strong>Supplier:</strong> {getSupplierName(product.supplier._id)}</Typography>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No products found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Product Modal */}
            <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add Product</DialogTitle>
                <DialogContent>
                    <AddProduct onProductAdded={(newProduct) => setProducts([...products, newProduct])} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddModal(false)} color="secondary">Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Update Product Modal */}
            <UpdateProduct product={selectedProduct} open={openEditModal} onClose={() => setOpenEditModal(false)} onProductUpdated={(updatedProduct) => setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p))} />

            {/* Confirm Delete Dialog */}
            <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete {confirmDelete?.name}?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDelete(null)} color="secondary">Cancel</Button>
                    <Button onClick={() => setProducts(products.filter(p => p._id !== confirmDelete._id))} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductList;
