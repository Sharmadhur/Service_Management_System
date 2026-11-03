const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true, unique: true },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'wallet'], default: 'card' },
    paymentStatus: { type: String, enum: ['pending', 'successful', 'failed'], default: 'pending' },
    transactionRef: { type: String, default: '' },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

paymentSchema.index({ customerId: 1, requestId: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
