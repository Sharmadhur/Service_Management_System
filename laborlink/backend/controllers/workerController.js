const Worker = require('../models/Worker');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const { findBestWorker } = require('../utils/assignWorker');

const getWorkerProfile = async (userId) => Worker.findOne({ userId });

// GET /api/worker/assignedJobs
exports.getAssignedJobs = async (req, res, next) => {
  try {
    const worker = await getWorkerProfile(req.user._id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker profile not found' });

    const jobs = await ServiceRequest.find({ workerId: worker._id })
      .populate('customerId', 'name phone email')
      .sort('-createdAt');
    res.json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
};

// PUT /api/worker/acceptJob/:id
exports.acceptJob = async (req, res, next) => {
  try {
    const worker = await getWorkerProfile(req.user._id);
    const job = await ServiceRequest.findOne({ _id: req.params.id, workerId: worker._id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status !== 'assigned') {
      return res.status(400).json({ success: false, message: `Cannot accept a job in status: ${job.status}` });
    }
    job.status = 'accepted';
    await job.save();
    worker.availability = 'busy';
    await worker.save();
    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// PUT /api/worker/rejectJob/:id - reassigns to next available worker
exports.rejectJob = async (req, res, next) => {
  try {
    const worker = await getWorkerProfile(req.user._id);
    const job = await ServiceRequest.findOne({ _id: req.params.id, workerId: worker._id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    job.rejectedWorkers.push(worker._id);
    job.workerId = null;
    job.status = 'requested';
    await job.save();

    const nextWorker = await findBestWorker(job);
    if (nextWorker) {
      job.workerId = nextWorker._id;
      job.status = 'assigned';
      await job.save();
    }

    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// PUT /api/worker/updateStatus/:id
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validTransitions = ['on_the_way', 'in_progress', 'completed'];
    if (!validTransitions.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const worker = await getWorkerProfile(req.user._id);
    const job = await ServiceRequest.findOne({ _id: req.params.id, workerId: worker._id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    job.status = status;
    await job.save();

    if (status === 'completed') {
      worker.availability = 'available';
      worker.completedJobs += 1;
      await worker.save();
    }

    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// PUT /api/worker/availability
exports.setAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;
    if (!['available', 'busy'].includes(availability)) {
      return res.status(400).json({ success: false, message: 'Invalid availability value' });
    }
    const worker = await Worker.findOneAndUpdate(
      { userId: req.user._id },
      { availability },
      { new: true }
    );
    res.json({ success: true, worker });
  } catch (err) {
    next(err);
  }
};

// PUT /api/worker/profile
exports.updateWorkerProfile = async (req, res, next) => {
  try {
    const { skills, experience, serviceArea, hourlyRate, city, lat, lng } = req.body;
    const update = {};
    if (skills) update.skills = Array.isArray(skills) ? skills : [skills];
    if (experience !== undefined) update.experience = experience;
    if (serviceArea) update.serviceArea = serviceArea;
    if (hourlyRate !== undefined) update.hourlyRate = hourlyRate;
    if (city) update['location.city'] = city;
    if (lat !== undefined) update['location.lat'] = lat;
    if (lng !== undefined) update['location.lng'] = lng;
    if (req.file) update.profileImage = `/uploads/${req.file.filename}`;

    const worker = await Worker.findOneAndUpdate({ userId: req.user._id }, { $set: update }, { new: true });
    res.json({ success: true, worker });
  } catch (err) {
    next(err);
  }
};

// GET /api/worker/earnings
exports.getEarnings = async (req, res, next) => {
  try {
    const worker = await getWorkerProfile(req.user._id);
    const jobs = await ServiceRequest.find({ workerId: worker._id, paymentStatus: 'paid' }).sort('-createdAt');
    res.json({
      success: true,
      totalEarnings: worker.earnings,
      completedJobs: worker.completedJobs,
      transactions: jobs,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/worker/reviews
exports.getReviews = async (req, res, next) => {
  try {
    const worker = await getWorkerProfile(req.user._id);
    const reviews = await Review.find({ workerId: worker._id })
      .populate('customerId', 'name')
      .sort('-createdAt');
    res.json({ success: true, rating: worker.rating, reviews });
  } catch (err) {
    next(err);
  }
};
