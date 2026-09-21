const Transaction = require('../models/Transaction');
const axios = require('axios');

/**
 * 1. Create QR code payload & store pending transaction in MongoDB
 */
const createQR = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: 'orderId and amount are required',
      });
    }

    // Create transaction document in MongoDB with status 'pending'
    const transaction = await Transaction.create({
      orderId: String(orderId),
      amount: Number(amount),
      currency: 'INR',
      status: 'pending',
    });

    // Format QR payload exactly as requested
    const Payload = {
      orderId: orderId,
      transactionId: transaction._id.toString(),
      amount: Number(amount),
      currency: 'INR',
      timestamp: Date.now(),
    };

    const finalQrString = JSON.stringify(Payload);

    return res.status(201).json({
      success: true,
      qrString: finalQrString,
      transactionId: transaction._id,
      orderId: transaction.orderId,
      amount: transaction.amount,
      status: transaction.status,
    });
  } catch (error) {
    console.error('Error creating QR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message,
    });
  }
};

/**
 * 2. Process decoded QR status update from Dummy UPI App & trigger Webhook
 */
const processPayment = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    if (!transactionId || !status) {
      return res.status(400).json({
        success: false,
        message: 'transactionId and status are required',
      });
    }

    const updatedStatus = status === 'success' ? 'success' : 'failed';

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { status: updatedStatus },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Send Webhook to Delivery App Server (URL configured via env variable)
    const webhookUrl = process.env.DELIVERY_APP_WEBHOOK_URL;
    let webhookStatus = 'not_configured';

    if (webhookUrl) {
      try {
        console.log(`Sending webhook notification to Delivery App at: ${webhookUrl}`);
        await axios.post(
          webhookUrl,
          {
            transactionId: transaction._id.toString(),
            orderId: transaction.orderId,
            amount: transaction.amount,
            status: transaction.status,
            currency: transaction.currency,
            timestamp: Date.now(),
          },
          { timeout: 10000 }
        );
        webhookStatus = 'delivered';
        console.log(`Webhook sent successfully to ${webhookUrl}`);
      } catch (webhookError) {
        console.error('Webhook sending failed:', webhookError.message);
        webhookStatus = `failed: ${webhookError.message}`;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Transaction status updated to ${transaction.status}`,
      transaction,
      webhookStatus,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message,
    });
  }
};

/**
 * 3. Fetch transaction status by ID
 */
const getTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    return res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createQR,
  processPayment,
  getTransactionStatus,
};
