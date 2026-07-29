const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    skills: [{ type: String, required: true }],
    experience: { type: Number, default: 0 }, // years
    location: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    serviceArea: { type: String, default: '' },
    availability: { type: String, enum: ['available', 'busy'], default: 'available' },
    hourlyRate: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    profileImage: { type: String, default: '' },
    verified: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    earnings: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Worker', workerSchema);
