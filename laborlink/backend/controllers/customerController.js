const crypto = require('crypto');
const Razorpay = require('razorpay');
const User = require('../models/User');
const Worker = require('../models/Worker');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const { findBestWorker, findNearbyWorkers } = require('../utils/assignWorker');

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const recalculateWorkerRating = async (workerId) => {
  if (!workerId) return null;
  const worker = await Worker.findById(workerId);
  if (!worker) return null;

  const reviews = await Review.find({ workerId: worker._id });
  const count = reviews.length;
  worker.ratingCount = count;
  worker.rating = count ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / count).toFixed(2)) : 0;
  await worker.save();
  return worker;
};

const markPaymentSuccessful = async (paymentDoc) => {
  if (!paymentDoc) return null;
  if (paymentDoc.paymentStatus === 'successful') {
    return paymentDoc;
  }

  paymentDoc.paymentStatus = 'successful';
  paymentDoc.paidAt = paymentDoc.paidAt || new Date();
  await paymentDoc.save();

  const request = await ServiceRequest.findById(paymentDoc.requestId);
  if (request) {
    request.paymentStatus = 'paid';
    request.amount = paymentDoc.amount;
    await request.save();
  }

  if (paymentDoc.workerId) {
    const worker = await Worker.findById(paymentDoc.workerId);
    if (worker) {
      worker.earnings = Number(worker.earnings || 0) + Number(paymentDoc.amount || 0);
      await worker.save();
    }
  }

  return paymentDoc;
};

exports.createRequest = async (req, res, next) => {
  try {
    const { category, description, address, city, lat, lng, preferredDate, preferredTime, workerId } = req.body;
    if (!category || !description || !address || !preferredDate || !preferredTime) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const requestPayload = {
      customerId: req.user._id,
      category,
      description,
      address,
      location: { city: city || '', lat: lat ?? null, lng: lng ?? null },
      preferredDate,
      preferredTime,
      status: 'requested',
      workerId: workerId || null,
    };

    if (workerId) {
      const selectedWorker = await Worker.findById(workerId).populate('userId', 'name email phone isBlocked');
      if (!selectedWorker || selectedWorker.verified !== 'approved' || selectedWorker.availability !== 'available') {
        return res.status(400).json({ success: false, message: 'Selected worker is not available right now.' });
      }
      if (!selectedWorker.skills.includes(category)) {
        return res.status(400).json({ success: false, message: 'Selected worker does not offer this service.' });
      }
      const activeJob = await ServiceRequest.findOne({
        workerId: selectedWorker._id,
        status: { $nin: ['completed', 'cancelled', 'rejected'] },
      });
      if (activeJob) {
        return res.status(409).json({ success: false, message: 'This worker is already assigned to an active job.' });
      }
      requestPayload.status = 'assigned';
    }

    const request = await ServiceRequest.create(requestPayload);
    res.status(201).json({ success: true, request, autoAssigned: !workerId });
  } catch (err) {
    next(err);
  }
};

exports.selectWorker = async (req, res, next) => {
  try {
    const { category, description, address, city, lat, lng, preferredDate, preferredTime, workerId } = req.body;
    if (!category || !description || !address || !preferredDate || !preferredTime || !workerId) {
      return res.status(400).json({ success: false, message: 'Missing required request details or worker selection' });
    }

    const selectedWorker = await Worker.findById(workerId).populate('userId', 'name isBlocked');
    if (!selectedWorker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    if (selectedWorker.verified !== 'approved' || selectedWorker.availability !== 'available') {
      return res.status(400).json({ success: false, message: 'This worker is not available for new jobs.' });
    }
    if (!selectedWorker.skills.includes(category)) {
      return res.status(400).json({ success: false, message: 'Selected worker is not skilled for this category.' });
    }
    if (selectedWorker.userId?.isBlocked) {
      return res.status(400).json({ success: false, message: 'This worker is blocked and cannot be selected.' });
    }

    const activeJob = await ServiceRequest.findOne({
      workerId: selectedWorker._id,
      status: { $nin: ['completed', 'cancelled', 'rejected'] },
    });
    if (activeJob) {
      return res.status(409).json({ success: false, message: 'This worker already has an active assignment.' });
    }

    const request = await ServiceRequest.create({
      customerId: req.user._id,
      workerId: selectedWorker._id,
      category,
      description,
      address,
      location: { city: city || '', lat: lat ?? null, lng: lng ?? null },
      preferredDate,
      preferredTime,
      status: 'assigned',
    });

    selectedWorker.availability = 'busy';
    await selectedWorker.save();

    res.status(201).json({ success: true, request, selectedWorker });
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
    if (request.workerId) {
      const worker = await Worker.findById(request.workerId);
      if (worker && worker.availability === 'busy') {
        worker.availability = 'available';
        await worker.save();
      }
    }
    res.json({ success: true, request });
  } catch (err) {
    next(err);
  }
};

exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ customerId: req.user._id })
      .populate('requestId', 'category status preferredDate amount')
      .populate('workerId', 'skills rating location')
      .sort('-createdAt');
    res.json({ success: true, payments });
  } catch (err) {
    next(err);
  }
};

// POST /api/customer/pay/:id - generate Razorpay order
exports.payForRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Request must be completed before payment' });
    }

    const existing = await Payment.findOne({ requestId: request._id, paymentStatus: 'successful' });
    if (existing) {
      return res.json({ success: true, alreadyPaid: true, payment: existing, request });
    }

    const worker = request.workerId ? await Worker.findById(request.workerId) : null;
    const baseAmount = Number(request.amount) > 0 ? Number(request.amount) : Number(worker?.hourlyRate || 500);
    const amountInPaise = Math.round(baseAmount * 100);

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(400).json({ success: false, message: 'Razorpay is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' });
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `laborlink_${request._id}`,
      notes: {
        requestId: String(request._id),
        customerId: String(req.user._id),
        workerId: request.workerId ? String(request.workerId) : '',
      },
    });

    const payment = await Payment.findOneAndUpdate(
      { requestId: request._id },
      {
        customerId: req.user._id,
        workerId: request.workerId,
        requestId: request._id,
        amount: baseAmount,
        paymentMethod: 'card',
        paymentStatus: 'pending',
        razorpayOrderId: order.id,
        transactionRef: `TXN-${Date.now()}`,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, order, payment, request });
  } catch (err) {
    next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, requestId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification payload is incomplete.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      requestId: requestId || { $exists: true },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.paymentStatus === 'successful') {
      return res.json({ success: true, payment, message: 'Payment already verified' });
    }

    if (expectedSignature !== razorpay_signature) {
      payment.paymentStatus = 'failed';
      payment.razorpayPaymentId = razorpay_payment_id;
      await payment.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed: invalid signature.' });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paidAt = new Date();
    const completedPayment = await markPaymentSuccessful(payment);
    res.json({ success: true, payment: completedPayment, message: 'Payment verified successfully' });
  } catch (err) {
    next(err);
  }
};

exports.handlePaymentWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body?.toString ? req.body.toString() : '';

    if (!secret || !signature || !rawBody) {
      return res.status(400).json({ success: false, message: 'Webhook payload is invalid.' });
    }

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (expected !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid Razorpay webhook signature.' });
    }

    const event = JSON.parse(rawBody);
    const entity = event?.payload?.payment?.entity;
    if (!entity) {
      return res.status(400).json({ success: false, message: 'No payment entity in webhook payload.' });
    }

    const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found for webhook.' });
    }

    if (payment.paymentStatus === 'successful') {
      return res.json({ success: true, received: true, alreadyProcessed: true });
    }

    payment.razorpayPaymentId = entity.id;
    payment.paidAt = new Date(entity.created_at * 1000);
    await markPaymentSuccessful(payment);
    res.json({ success: true, received: true });
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

    await recalculateWorkerRating(request.workerId);
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

exports.searchNearbyWorkers = async (req, res, next) => {
  try {
    const { category, city, lat, lng, radius = 20, limit = 10 } = req.query;
    if (!category) {
      return res.status(400).json({ success: false, message: 'A service category is required.' });
    }

    const workers = await findNearbyWorkers({
      category,
      city: city || '',
      lat: lat != null ? Number(lat) : null,
      lng: lng != null ? Number(lng) : null,
      radiusKm: Number(radius) || 20,
      limit: Number(limit) || 10,
    });

    res.json({ success: true, workers, radius: Number(radius) || 20, total: workers.length });
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

exports.getWorkerPublicProfile = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.workerId)
      .populate('userId', 'name email phone')
      .lean();
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const reviews = await Review.find({ workerId: worker._id })
      .populate('customerId', 'name')
      .sort('-createdAt')
      .lean();

    const merged = {
      ...worker,
      rating: Number(worker.rating || 0),
      ratingCount: Number(worker.ratingCount || reviews.length),
      reviewCount: reviews.length,
      reviews,
    };

    res.json({ success: true, worker: merged });
  } catch (err) {
    next(err);
  }
};

exports.getWorkerReviews = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.workerId);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const reviews = await Review.find({ workerId: worker._id })
      .populate('customerId', 'name')
      .sort('-createdAt');

    res.json({ success: true, rating: worker.rating, reviewCount: worker.ratingCount, reviews });
  } catch (err) {
    next(err);
  }
};

exports.getMyWorkerProfile = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker profile not found' });

    const reviews = await Review.find({ workerId: worker._id }).populate('customerId', 'name').sort('-createdAt');
    res.json({ success: true, worker, reviews });
  } catch (err) {
    next(err);
  }
};

exports.findBestWorkerForRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    const worker = await findBestWorker(request);
    res.json({ success: true, worker });
  } catch (err) {
    next(err);
  }
};
