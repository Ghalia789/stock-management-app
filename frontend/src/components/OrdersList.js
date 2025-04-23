import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter, TablePagination,
    Paper, Button, TextField, Box, Dialog, DialogContent,
    DialogActions, IconButton, Select, MenuItem, FormControl, InputLabel,
    Typography, Collapse, Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreateOrderForm from './CreateOrderForm';
import DownloadOrderPdfButton from './DownloadOrderPdfButton';


const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState("All");
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [openOrderDialog, setOpenOrderDialog] = useState(false); // State for dialog
    const [refreshOrders, setRefreshOrders] = useState(false);
    //pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10); 

    useEffect(() => {
        fetch('http://localhost:5000/api/orders/')
            .then(res => res.json())
            .then(data => {
                console.log("Fetched orders:", data);
                setOrders(data);
            })
            .catch(error => console.error('Error fetching orders:', error));
    }, [refreshOrders]);

    const handleToggleExpand = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId, status: newStatus })
            });
    
            if (response.ok) {
                const updatedOrders = orders.map(order =>
                    order._id === orderId ? { ...order, status: newStatus } : order
                );
                setOrders(updatedOrders);
            } else {
                console.error('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };
    
    

    const filteredOrders = orders
    .filter(order =>
        order.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterStatus === "All" || order.status === filterStatus)
    )
    .sort((a, b) => {
        const dateA = new Date(a.orderDate);
        const dateB = new Date(b.orderDate);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    // Paginate the orders
// Pagination logic
const startIndex = page * rowsPerPage; // Determine the starting index based on the current page
const paginatedOrders = filteredOrders.slice(startIndex, startIndex + rowsPerPage); // Get the slice of orders for the current page

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
                    <InputLabel>Sort by Date</InputLabel>
                    <Select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        label="Sort by Date"
                    >
                        <MenuItem value="desc">Newest First</MenuItem>
                        <MenuItem value="asc">Oldest First</MenuItem>
                    </Select>
                </FormControl>

                <FormControl variant="outlined" sx={{ mb: 2, width: { xs: "100%", sm: "200px" } }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="Status"
                    >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Ordered">Ordered</MenuItem>
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
                    {paginatedOrders.length > 0 ? (
                            paginatedOrders.map((order) => (
                                <React.Fragment key={order._id}>
                                    <TableRow>
                                        <TableCell sx={{ width: "50px", padding: "8px" }}>
                                            <Tooltip title="Details"> 
                                                <IconButton
                                                    onClick={() => handleToggleExpand(order._id)}
                                                    size="small"
                                                >
                                                    {expandedOrderId === order._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{order.supplier?.name}</TableCell>
                                        <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>                                        <TableCell>{order.status}</TableCell>
                                        <TableCell>
    {order.status === 'Pending' && (
        <Button
            variant="contained"
            color="warning"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleUpdateOrderStatus(order._id, 'Ordered')}
        >
            Mark as Ordered
        </Button>
    )}

    {order.status === 'Ordered' && (
        <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleUpdateOrderStatus(order._id, 'Received')}
        >
            Mark as Received
        </Button>
    )}

    {order.status === 'Received' && (
        <Button variant="outlined" disabled>
            Received
        </Button>
    )}
</TableCell>

                                        <TableCell>
                                            <DownloadOrderPdfButton orderId={order._id} />
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ padding: 0 }}>
                                            <Collapse in={expandedOrderId === order._id} timeout="auto" unmountOnExit>
                                                <Box sx={{ padding: 2, backgroundColor: "#f9f9f9", borderTop: "1px solid #ddd" }}>
                                                    <Typography variant="body1"><strong>Products:</strong></Typography>
                                                    <ul>
                                                        {order.products.map((product, index) => (
                                                            <li key={index}>
                                                                {product.productId.name} - {product.quantityOrdered} units
                                                            </li>
                                                        ))}
                                                        <Typography variant="body1" sx={{ mt: 2 }}>
                                                            <strong>Total:</strong> ${order.totalCost?.toFixed(2)}
                                                        </Typography>
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
                    <TableFooter>
    <TableRow>
        <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            count={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0); // Reset to first page
            }}
        />
    </TableRow>
</TableFooter>
                </Table>
            </TableContainer>

            {/* Create Order Dialog */}
            <Dialog
                open={openOrderDialog}
                onClose={() => setOpenOrderDialog(false)}
                fullWidth
                maxWidth="lg"
            >

                <DialogContent sx={{ paddingX: 3, paddingY: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <CreateOrderForm onSuccess={() => setOpenOrderDialog(false)}
                            onOrderSuccess={() => setRefreshOrders(prev => !prev)} />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', paddingBottom: '16px' }}>
                    <Button
                        onClick={() => setOpenOrderDialog(false)}
                        color="secondary"
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default OrdersList;
