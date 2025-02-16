import React, { useState } from 'react';
import { Container, Grid, Toolbar, Paper, Typography, Box } from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [open, setOpen] = useState(true);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar handleDrawerToggle={handleDrawerToggle} open={open} />

      {/* Sidebar should not be inside another Drawer */}
      <Sidebar open={open} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1,
          mt: 4,
          transition: 'margin-left 0.3s',
          marginLeft: open ? '80px' : '60px', // Ensure correct width
          width: `calc(100% - ${open ? 80 : 60}px)`, // Adjust width dynamically
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6">Total Products</Typography>
                <Typography variant="h4">1234</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6">Total Orders</Typography>
                <Typography variant="h4">567</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6">Total Revenue</Typography>
                <Typography variant="h4">$12,345</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Sales Overview</Typography>
                {/* Add your chart component here */}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Recent Orders</Typography>
                {/* Add your table component here */}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
