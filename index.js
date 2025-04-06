// Main Express server for Stock Management Application
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const itemRoutes = require('./src/api/routes/itemRoutes');
const stockRoutes = require('./src/api/routes/stockRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/items', itemRoutes);
app.use('/api/stock', stockRoutes);

// Root API route - API information
app.get('/api', (req, res) => {
  res.json({
    name: 'Stock Management API',
    version: '1.0.0',
    endpoints: {
      items: '/api/items',
      stock: '/api/stock'
    }
  });
});

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  // Serve frontend static files
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  
  // Serve SPA for any other request
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Not found middleware
app.use((req, res) => {
  res.status(404).json({
    error: 'Resource not found'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 API endpoints available at http://localhost:${PORT}/api`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Serving frontend at http://localhost:${PORT}`);
  } else {
    console.log(`🌐 Frontend development server should be started separately`);
  }
  
  console.log(`\nEnvironment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  
  // Close server & exit process
  process.exit(1);
});

module.exports = app; // Export for testing