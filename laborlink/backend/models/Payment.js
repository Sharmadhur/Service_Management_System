const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'wallet'], default: 'card' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    transactionRef: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
