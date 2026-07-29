const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', default: null },
    category: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      city: { type: String, default: '' },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'requested',
        'assigned',
        'accepted',
        'rejected',
        'on_the_way',
        'in_progress',
        'completed',
        'cancelled',
      ],
      default: 'requested',
    },
    rejectedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }],
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
