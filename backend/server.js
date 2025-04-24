const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const supplierRoutes = require('./routes/suppliers');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');



dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true, // Allow cookies and credentials
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  // Add stock monitoring function
const checkAndNotifyLowStock = async () => {
    try {
      const lowStockProducts = await productRoutes.checkLowStockProducts();
      
      if (lowStockProducts.length > 0) {
        io.emit('lowStockNotification', {
          count: lowStockProducts.length,
          products: lowStockProducts.map(p => ({
            id: p._id,
            name: p.name,
            stock: p.stock,
            threshold: p.lowStockThreshold,
            supplier: p.supplier
          }))
        });
      }
    } catch (error) {
      console.error('Error in stock monitoring:', error);
    }
  };
  // Check stock every hour (adjust as needed)
setInterval(checkAndNotifyLowStock, 3600000);

// Also check immediately on startup
checkAndNotifyLowStock();

server.listen(5000, () => console.log('Server running on port 5000'));