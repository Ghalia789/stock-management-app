import React, { useState } from "react";
import { Container, Toolbar, Paper, Typography, Box } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import OrdersList from "../components/OrdersList"; 

const OrdersPage = () => {
    const [open, setOpen] = useState(true);

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar handleDrawerToggle={handleDrawerToggle} open={open} />
            <Sidebar open={open} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 2,
                    mt: 4,
                    transition: "margin-left 0.3s",
                    marginLeft: open ? "80px" : "60px",
                    width: `calc(100% - ${open ? 80 : 60}px)`,
                }}
            >
                <Toolbar />
                <Container maxWidth="lg">
                    <Paper sx={{ p: 1, mb: 2, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100px" }}>
                        <Typography variant="h4" sx={{ fontFamily: '"Allura", cursive', fontSize: '4rem', textAlign: 'center' }}>
                            Orders
                        </Typography>                    
                    </Paper>
                    <OrdersList />
                </Container>
            </Box>
        </Box>
    );
};

export default OrdersPage;
