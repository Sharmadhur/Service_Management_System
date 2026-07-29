const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Worker = require('../models/Worker');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password, phone, role, skills, experience, serviceArea, hourlyRate } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const userRole = ['customer', 'worker'].includes(role) ? role : 'customer';
    const user = await User.create({ name, email, password, phone, role: userRole });

    if (userRole === 'worker') {
      await Worker.create({
        userId: user._id,
        skills: Array.isArray(skills) ? skills : skills ? [skills] : [],
        experience: experience || 0,
        serviceArea: serviceArea || '',
        hourlyRate: hourlyRate || 0,
      });
    }

    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
    }

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    let profile = { ...req.user.toObject() };
    if (req.user.role === 'worker') {
      const workerProfile = await Worker.findOne({ userId: req.user._id });
      profile.workerProfile = workerProfile;
    }
    res.json({ success: true, user: profile });
  } catch (err) {
    next(err);
  }
};
