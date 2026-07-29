const User = require('../models/User');
const Worker = require('../models/Worker');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const { findBestWorker } = require('../utils/assignWorker');

// POST /api/customer/request - create a new service request & auto-assign
exports.createRequest = async (req, res, next) => {
  try {
    const { category, description, address, city, lat, lng, preferredDate, preferredTime } = req.body;
    if (!category || !description || !address || !preferredDate || !preferredTime) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const request = await ServiceRequest.create({
      customerId: req.user._id,
      category,
      description,
      address,
      location: { city: city || '', lat: lat ?? null, lng: lng ?? null },
      preferredDate,
      preferredTime,
      status: 'requested',
    });

    const worker = await findBestWorker(request);
    if (worker) {
      request.workerId = worker._id;
      request.status = 'assigned';
      await request.save();
    }

    res.status(201).json({ success: true, request });
  } catch (err) {
    next(err);
  }
};

// GET /api/customer/myRequests
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find({ customerId: req.user._id })
      .populate({ path: 'workerId', populate: { path: 'userId', select: 'name phone email' } })
      .sort('-createdAt');
    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
};

// PUT /api/customer/cancelRequest/:id
exports.cancelRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (['completed', 'cancelled'].includes(request.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${request.status} request` });
    }
    request.status = 'cancelled';
    await request.save();
    res.json({ success: true, request });
  } catch (err) {
    next(err);
  }
};

// POST /api/customer/pay/:id - dummy payment
exports.payForRequest = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;
    const request = await ServiceRequest.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Request must be completed before payment' });
    }

    const payment = await Payment.create({
      requestId: request._id,
      amount: amount || request.amount || 0,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'paid',
      transactionRef: `TXN-${Date.now()}`,
    });

    request.paymentStatus = 'paid';
    request.amount = payment.amount;
    await request.save();

    if (request.workerId) {
      await Worker.findByIdAndUpdate(request.workerId, { $inc: { earnings: payment.amount } });
    }

    res.json({ success: true, payment, request });
  } catch (err) {
    next(err);
  }
};

// POST /api/customer/review - rate & review worker
exports.submitReview = async (req, res, next) => {
  try {
    const { requestId, rating, review } = req.body;
    const request = await ServiceRequest.findOne({ _id: requestId, customerId: req.user._id });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed jobs' });
    }

    const existing = await Review.findOne({ requestId });
    if (existing) return res.status(400).json({ success: false, message: 'Review already submitted' });

    const newReview = await Review.create({
      requestId,
      customerId: req.user._id,
      workerId: request.workerId,
      rating,
      review,
    });

    const worker = await Worker.findById(request.workerId);
    if (worker) {
      const totalRating = worker.rating * worker.ratingCount + rating;
      worker.ratingCount += 1;
      worker.rating = Number((totalRating / worker.ratingCount).toFixed(2));
      await worker.save();
    }

    res.status(201).json({ success: true, review: newReview });
  } catch (err) {
    next(err);
  }
};

// GET /api/customer/myReviews - reviews submitted by this customer
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ customerId: req.user._id })
      .populate({ path: 'workerId', populate: { path: 'userId', select: 'name' } })
      .sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
};

// GET /api/customer/searchWorkers - search/filter workers
exports.searchWorkers = async (req, res, next) => {
  try {
    const { skill, minRating, city, page = 1, limit = 10 } = req.query;
    const query = { verified: 'approved' };
    if (skill) query.skills = { $in: [skill] };
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (city) query['location.city'] = new RegExp(city, 'i');

    const workers = await Worker.find(query)
      .populate('userId', 'name email phone')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-rating');

    const total = await Worker.countDocuments(query);
    res.json({ success: true, workers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/customer/favorite/:workerId - toggle favorite worker
exports.toggleFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = user.favoriteWorkers.findIndex((w) => w.toString() === req.params.workerId);
    if (idx > -1) {
      user.favoriteWorkers.splice(idx, 1);
    } else {
      user.favoriteWorkers.push(req.params.workerId);
    }
    await user.save();
    res.json({ success: true, favoriteWorkers: user.favoriteWorkers });
  } catch (err) {
    next(err);
  }
};

// PUT /api/customer/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { ...(name && { name }), ...(phone && { phone }), ...(address && { address }) } },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
