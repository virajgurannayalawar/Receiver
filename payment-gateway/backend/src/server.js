const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const paymentRoutes = require('./routes/paymentRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint (useful for Render deployment)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Payment Gateway Mini Backend', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.send('Payment Gateway Backend Service is running');
});

// API Routes
app.use('/api/payment', paymentRoutes);

// Port setup for deployment (Render exposes PORT env var)
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Payment Gateway Backend running on port ${PORT}`);
});
