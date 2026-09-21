const express = require('express');
const router = express.Router();
const {
  createQR,
  processPayment,
  getTransactionStatus,
} = require('../controllers/paymentController');

// Route for delivery app server to generate QR payload & create pending transaction
router.post('/create-qr', createQR);

// Route for dummy UPI web app to submit payment result (updates status & fires webhook)
router.post('/process', processPayment);

// Route to query transaction status
router.get('/status/:id', getTransactionStatus);

module.exports = router;
