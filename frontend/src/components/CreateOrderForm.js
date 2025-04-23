import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
    Box, Typography, Select, MenuItem, FormControl, 
    InputLabel, TextField, Button, Table, TableHead, 
    TableBody, TableRow, TableCell, Paper, Card, 
    CardContent, Divider, Grid, Alert, Snackbar 
} from "@mui/material";

const CreateOrderForm = ({ currentUser , onOrderSuccess}) => {
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [products, setProducts] = useState([]);
    const [orderItems, setOrderItems] = useState({});
    const [total, setTotal] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/suppliers");
                setSuppliers(response.data);
            } catch (err) {
                console.error("Error fetching suppliers:", err);
                setError("Failed to load suppliers. Please try again.");
            }
        };
        fetchSuppliers();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedSupplier) return;
            
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/products/by-supplier?supplier=${selectedSupplier}`
                );
                
                // Filter out products with missing required fields
                const validProducts = response.data.filter(product => 
                    product._id && product.name && product.stock !== undefined && 
                    product.price && product.supplier
                );
                
                setProducts(validProducts);
                setOrderItems({});
                
                if (validProducts.length < response.data.length) {
                    setError(`Warning: ${response.data.length - validProducts.length} products excluded due to missing data`);
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products. Please try again.");
            }
        };
        
        fetchProducts();
    }, [selectedSupplier]);

    const handleQuantityChange = (productId, quantity) => {
        const numQuantity = Math.max(0, parseInt(quantity) || 0);
        const newOrderItems = { ...orderItems, [productId]: numQuantity };
        setOrderItems(newOrderItems);

        // Calculate total
        const newTotal = Object.entries(newOrderItems).reduce((sum, [id, qty]) => {
            const product = products.find(p => p._id === id);
            return sum + (product ? product.price * qty : 0);
        }, 0);
        setTotal(newTotal);
    };

    const handleSubmitOrder = async () => {
        setError(null);
        
        // Basic validation
        if (!selectedSupplier) {
            setError("Please select a supplier");
            return;
        }

        const orderedProducts = Object.entries(orderItems)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => ({
                productId: id,
                quantityOrdered: qty,
                unitPrice: products.find(p => p._id === id)?.price || 0
            }));

        if (orderedProducts.length === 0) {
            setError("Please add at least one product to the order");
            return;
        }

        setIsSubmitting(true);
        
        try {
            const orderData = {
                supplier: selectedSupplier,
                products: orderedProducts,
                orderedBy: currentUser?.name || "System", // Use actual user name
                status: "Pending",
                isAutoOrder: false
            };

            console.log("Submitting order:", orderData); // Debug
            
            const response = await axios.post(
                "http://localhost:5000/api/orders", 
                orderData
            );

            setSuccess(true);
            setOrderItems({});
            setTotal(0);
            setSelectedSupplier("");
            setProducts([]);
            onOrderSuccess();

            console.log("Order response:", response.data); // Debug
        } catch (err) {
            console.error("Order submission error:", err);
            
            const errorMessage = err.response?.data?.message || 
                               err.response?.data?.error || 
                               "Failed to place order. Please try again.";
            
            setError(errorMessage);
            
            if (err.response?.data?.errors) {
                console.error("Validation errors:", err.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const lowStockProducts = products.filter(p => p.stock < (p.lowStockThreshold || 10));
    const normalStockProducts = products.filter(p => p.stock >= (p.lowStockThreshold || 10));

    const handleCloseAlert = () => {
        setError(null);
        setSuccess(false);
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
            <Snackbar
                open={!!error || success}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                {error ? (
                    <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                ) : (
                    <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
                        Order placed successfully!
                    </Alert>
                )}
            </Snackbar>

            <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
                        Create New Order
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Select Supplier</InputLabel>
                        <Select
                            value={selectedSupplier}
                            onChange={e => setSelectedSupplier(e.target.value)}
                            label="Select Supplier"
                        >
                            <MenuItem value="">-- Select Supplier --</MenuItem>
                            {suppliers.map(s => (
                                <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {products.length > 0 && (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" color="error">
                                        ⚠️ Low-Stock Products
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <ProductTable 
                                        products={lowStockProducts}
                                        orderItems={orderItems}
                                        onChange={handleQuantityChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" color="success.main">
                                        ✔️ Normal Stock Products
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <ProductTable 
                                        products={normalStockProducts}
                                        orderItems={orderItems}
                                        onChange={handleQuantityChange}
                                    />
                                </Grid>
                            </Grid>

                            <Typography variant="h5" sx={{ mt: 3, textAlign: "center" }}>
                                Total: ${total.toFixed(2)}
                            </Typography>

                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={isSubmitting || total === 0}
                                onClick={handleSubmitOrder}
                                sx={{ mt: 3 }}
                            >
                                {isSubmitting ? "Processing..." : "Place Order"}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

// Separate component for product table
const ProductTable = ({ products, orderItems, onChange }) => {
    if (products.length === 0) {
        return <Typography>No products in this category</Typography>;
    }

    return (
        <Paper sx={{ overflow: "hidden" }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Order Qty</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map(product => (
                        <TableRow key={product._id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>${product.price.toFixed(2)}</TableCell>
                            <TableCell>
                                <TextField
                                    type="number"
                                    size="small"
                                    value={orderItems[product._id] || 0}
                                    onChange={e => onChange(product._id, e.target.value)}
                                    inputProps={{ min: 0 }}
                                    sx={{ width: 80 }}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default CreateOrderForm;