const User = require('../models/User');
const Worker = require('../models/Worker');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Category = require('../models/Category');

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/workers
exports.getWorkers = async (req, res, next) => {
  try {
    const { verified, page = 1, limit = 20 } = req.query;
    const query = {};
    if (verified) query.verified = verified;
    const workers = await Worker.find(query)
      .populate('userId', 'name email phone isBlocked')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');
    const total = await Worker.countDocuments(query);
    res.json({ success: true, workers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/approveWorker/:id
exports.approveWorker = async (req, res, next) => {
  try {
    const { decision } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'decision must be approved or rejected' });
    }
    const worker = await Worker.findByIdAndUpdate(req.params.id, { verified: decision }, { new: true });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    res.json({ success: true, worker });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/requests
exports.getRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const requests = await ServiceRequest.find(query)
      .populate('customerId', 'name email phone')
      .populate({ path: 'workerId', populate: { path: 'userId', select: 'name email phone' } })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');
    const total = await ServiceRequest.countDocuments(query);
    res.json({ success: true, requests, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/assignWorker/:id - manually assign or reassign
exports.assignWorker = async (req, res, next) => {
  try {
    const { workerId } = req.body;
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { workerId, status: 'assigned' },
      { new: true }
    );
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, request });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/blockUser/:id
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/user/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'worker') await Worker.findOneAndDelete({ userId: user._id });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// Categories CRUD
// GET /api/admin/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/categories
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/reviews
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('customerId', 'name')
      .populate({ path: 'workerId', populate: { path: 'userId', select: 'name' } })
      .sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const [totalCustomers, totalWorkers, pendingRequests, completedRequests, activeWorkers] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'worker' }),
      ServiceRequest.countDocuments({ status: { $nin: ['completed', 'cancelled'] } }),
      ServiceRequest.countDocuments({ status: 'completed' }),
      Worker.countDocuments({ availability: 'available', verified: 'approved' }),
    ]);

    const revenueAgg = await ServiceRequest.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const revenue = revenueAgg[0]?.total || 0;

    const avgRatingAgg = await Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]);
    const averageRating = Number((avgRatingAgg[0]?.avg || 0).toFixed(2));

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const jobsToday = await ServiceRequest.countDocuments({ createdAt: { $gte: startOfDay } });

    // Monthly requests (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    const monthlyRequests = await ServiceRequest.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Category-wise jobs
    const categoryWise = await ServiceRequest.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalWorkers,
        pendingRequests,
        completedRequests,
        revenue,
        averageRating,
        activeWorkers,
        jobsToday,
      },
      charts: { monthlyRequests, categoryWise },
    });
  } catch (err) {
    next(err);
  }
};
