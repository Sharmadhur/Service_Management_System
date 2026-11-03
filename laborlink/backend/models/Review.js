const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: '' },
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ workerId: 1, createdAt: -1 });
reviewSchema.index({ customerId: 1, workerId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
