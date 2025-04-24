import React, { useState, useEffect } from "react";
import { 
  Container, Toolbar, Paper, Typography, Box, Grid, Button, 
  Card, CardContent, CircularProgress, Alert
} from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryIcon from "@mui/icons-material/Category";
import TimelineIcon from "@mui/icons-material/Timeline";

const DashboardPage = () => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for dashboard data
  const [stockOverview, setStockOverview] = useState(null);
  const [inventoryValue, setInventoryValue] = useState(null);
  const [stockMovements, setStockMovements] = useState([]);
  const [inventoryReport, setInventoryReport] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [quarterlyTrends, setQuarterlyTrends] = useState([]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9F44D3'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stock overview
        const overviewResponse = await fetch('http://localhost:5000/api/dashboard/stock-overview');
        const overviewData = await overviewResponse.json();
        
        // Fetch inventory value
        const valueResponse = await fetch('http://localhost:5000/api/dashboard/inventory-value');
        const valueData = await valueResponse.json();
        
        // Fetch stock movements (monthly)
        const movementsResponse = await fetch('http://localhost:5000/api/dashboard/stock-movements?period=monthly');
        const movementsData = await movementsResponse.json();
        
        // Fetch inventory report
        const reportResponse = await fetch('http://localhost:5000/api/dashboard/inventory-report');
        const reportData = await reportResponse.json();

        // Update states with fetched data
        setStockOverview(overviewData);
        setInventoryValue(valueData);
        setStockMovements(movementsData.movements);
        setInventoryReport(reportData.report);
        
        // Generate mock data for new charts
        generateCategoryData(reportData.report);
        generateQuarterlyTrends();
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
        console.error("Dashboard data fetch error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  // Generate category data for radar chart
  const generateCategoryData = (report) => {
    if (!report || !report.length) return;

    // Group by category
    const categories = {};
    report.forEach(item => {
      if (!item.category) return;
      
      if (!categories[item.category]) {
        categories[item.category] = {
          category: item.category,
          quantity: 0,
          value: 0
        };
      }
      
      categories[item.category].quantity += item.quantity || 0;
      categories[item.category].value += item.totalValue || 0;
    });
    
    setCategoryData(Object.values(categories));
  };

  // Generate quarterly trends for area chart
  const generateQuarterlyTrends = () => {
    const quarters = [
      { name: 'Q1', inflow: Math.floor(Math.random() * 500) + 100, outflow: Math.floor(Math.random() * 400) + 50 },
      { name: 'Q2', inflow: Math.floor(Math.random() * 500) + 100, outflow: Math.floor(Math.random() * 400) + 50 },
      { name: 'Q3', inflow: Math.floor(Math.random() * 500) + 100, outflow: Math.floor(Math.random() * 400) + 50 },
      { name: 'Q4', inflow: Math.floor(Math.random() * 500) + 100, outflow: Math.floor(Math.random() * 400) + 50 },
    ];
    
    setQuarterlyTrends(quarters);
  };

  // Get top 5 products by value
  const getTopProducts = () => {
    if (!inventoryReport) return [];
    return [...inventoryReport]
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
  };

  // Handle export functions
  const handleExportCSV = () => {
    window.location.href = 'http://localhost:5000/api/dashboard/export/csv';
  };

  const handleExportPDF = () => {
    window.location.href = 'http://localhost:5000/api/dashboard/export/pdf';
  };

  const handleExportExcel = () => {
    window.location.href = 'http://localhost:5000/api/dashboard/export/excel';
  };

  // Format currency to Tunisian Dinar
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(value);
  };

  // Prepare movement data for chart
  const prepareMovementData = () => {
    if (!stockMovements.length) return [];
    
    // Group by date and count
    const groupedData = stockMovements.reduce((acc, movement) => {
      const date = new Date(movement.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, count: 0 };
      }
      acc[date].count++;
      return acc;
    }, {});
    
    return Object.values(groupedData);
  };

  // Generate product price vs quantity data
  const generatePriceQuantityData = () => {
    if (!inventoryReport) return [];
    return inventoryReport.map(item => ({
      name: item.name,
      price: item.unitPrice || 0,
      quantity: item.quantity || 0,
      value: item.totalValue || 0
    })).slice(0, 10);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
          {/* Header */}
          <Paper sx={{ p: 2, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h4" sx={{ fontFamily: '"Allura", cursive', fontSize: '3rem' }}>
              Inventory Dashboard
            </Typography>
            <Box>
              <Button 
                variant="outlined" 
                startIcon={<FileDownloadIcon />} 
                sx={{ mr: 1 }}
                onClick={handleExportCSV}
              >
                CSV
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<FileDownloadIcon />} 
                sx={{ mr: 1 }}
                onClick={handleExportPDF}
              >
                PDF
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<FileDownloadIcon />}
                onClick={handleExportExcel}
              >
                Excel
              </Button>
            </Box>
          </Paper>

          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#f3f6f9', height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <InventoryIcon sx={{ fontSize: 40, color: '#8884d8', mb: 1 }} />
                  <Typography variant="h5" component="div">
                    Total Products
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
                    {stockOverview?.totalProducts || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#f3f6f9', height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#82ca9d', mb: 1 }} />
                  <Typography variant="h5" component="div">
                    Total Quantity
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
                    {stockOverview?.totalQuantity || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#f3f6f9', height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AttachMoneyIcon sx={{ fontSize: 40, color: '#ffc658', mb: 1 }} />
                  <Typography variant="h5" component="div">
                    Inventory Value
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
                    {inventoryValue ? formatCurrency(inventoryValue.totalValue) : '0.000 TND'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Row 1 */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Product Value Distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Product Value Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getTopProducts()}
                      dataKey="totalValue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={entry => entry.name}
                    >
                      {getTopProducts().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Stock Movement Trends */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Stock Movement Trends
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={prepareMovementData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" name="Movements" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Row 2 */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Top Products */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top Products by Value
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTopProducts()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="totalValue" fill="#82ca9d" name="Total Value" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Quarterly Trends Area Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <TimelineIcon sx={{ mr: 1 }} />
                  Quarterly Stock Flow
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={quarterlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="inflow" stackId="1" stroke="#8884d8" fill="#8884d8" name="Stock In" />
                    <Area type="monotone" dataKey="outflow" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Stock Out" />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Row 3 - New Charts */}
          <Grid container spacing={3}>
            {/* Product Price vs Quantity Scatter Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Price vs Quantity Analysis
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="price" name="Price (TND)" unit=" TND" />
                    <YAxis type="number" dataKey="quantity" name="Quantity" />
                    <Tooltip formatter={(value, name) => {
                      return name === "Price (TND)" ? formatCurrency(value) : value;
                    }} />
                    <Legend />
                    <Scatter name="Products" data={generatePriceQuantityData()} fill="#8884d8">
                      {generatePriceQuantityData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Category Radar Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <CategoryIcon sx={{ mr: 1 }} />
                  Category Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis />
                    <Radar name="Quantity" dataKey="quantity" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </RadarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardPage;