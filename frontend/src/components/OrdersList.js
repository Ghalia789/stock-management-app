import React, { useEffect, useState } from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, Button, TextField, Box, Dialog, DialogTitle, DialogContent, 
    DialogActions, IconButton, Select, MenuItem, FormControl, InputLabel, 
    Typography, Collapse
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreateOrderForm from './CreateOrderForm'; // Import the form

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState("All");
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [openOrderDialog, setOpenOrderDialog] = useState(false); // State for dialog

    useEffect(() => {
        fetch('http://localhost:5000/api/orders')
            .then(res => res.json())
            .then(data => setOrders(data))
            .catch(error => console.error('Error fetching orders:', error));
    }, []);

    const handleToggleExpand = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const handleMarkAsReceived = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/receive`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const updatedOrders = orders.map(order => 
                    order._id === orderId ? { ...order, status: 'Received' } : order
                );
                setOrders(updatedOrders);
            } else {
                console.error('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const filteredOrders = orders.filter(order =>
        (typeof order.supplier === 'string' && order.supplier.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterStatus === "All" || order.status === filterStatus)
    );
    

    return (
        <Box>
            {/* Top Bar with Search, Filter, and Create Order Button */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <TextField
                    label="Search by Supplier"
                    variant="outlined"
                    sx={{ mb: 2, width: { xs: "100%", sm: "250px" } }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <FormControl variant="outlined" sx={{ mb: 2, width: { xs: "100%", sm: "200px" } }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="Status"
                    >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Received">Received</MenuItem>
                    </Select>
                </FormControl>

                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => setOpenOrderDialog(true)} 
                >
                    Create Order
                </Button>
            </Box>

            {/* Orders Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell><strong>Supplier</strong></TableCell>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <React.Fragment key={order._id}>
                                    <TableRow>
                                        <TableCell sx={{ width: "50px", padding: "8px" }}>
                                            <IconButton 
                                                onClick={() => handleToggleExpand(order._id)}
                                                size="small"
                                            >
                                                {expandedOrderId === order._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{order.supplier}</TableCell>
                                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{order.status}</TableCell>
                                        <TableCell>
                                            {order.status === 'Pending' && (
                                                <Button 
                                                    variant="contained" 
                                                    color="success" 
                                                    startIcon={<CheckCircleIcon />} 
                                                    onClick={() => handleMarkAsReceived(order._id)}
                                                >
                                                    Mark as Received
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ padding: 0 }}>
                                            <Collapse in={expandedOrderId === order._id} timeout="auto" unmountOnExit>
                                                <Box sx={{ padding: 2, backgroundColor: "#f9f9f9", borderTop: "1px solid #ddd" }}>
                                                    <Typography variant="body1"><strong>Products:</strong></Typography>
                                                    <ul>
                                                        {order.products.map((product, index) => (
                                                            <li key={index}>{product.name} - {product.quantity} units</li>
                                                        ))}
                                                    </ul>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No orders found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Order Dialog */}
            <Dialog open={openOrderDialog} onClose={() => setOpenOrderDialog(false)} fullWidth maxWidth="md">
                <DialogTitle>Create New Order</DialogTitle>
                <DialogContent>
                    <CreateOrderForm />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenOrderDialog(false)} color="secondary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrdersList;
