const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendAuthResponse = (res, statusCode, user) => {
  res.status(statusCode).json({
    success: true,
    token: generateToken(user),
    user, // password is stripped by the toJSON transform in the model
  });
};

// Converts Mongoose / Mongo errors into clean API responses
const handleError = (res, error) => {
  if (error.code === 11000) {
    return res
      .status(409)
      .json({ success: false, message: 'An account with this email already exists' });
  }
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors)
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ success: false, message });
  }
  console.error(error);
  return res.status(500).json({ success: false, message: 'Server error' });
};

// @route   POST /api/auth/register/customer
// @access  Public
const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, city } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password, phone, city, role: 'customer' });
    sendAuthResponse(res, 201, user);
  } catch (error) {
    handleError(res, error);
  }
};

// @route   POST /api/auth/register/provider
// @access  Public
const registerProvider = async (req, res) => {
  try {
    const { name, email, password, phone, city, businessName, serviceCategory, description } =
      req.body;

    if (!name || !email || !password || !businessName || !serviceCategory) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, business name and service category are required',
      });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      city,
      businessName,
      serviceCategory,
      description,
      role: 'provider',
    });
    sendAuthResponse(res, 201, user);
  } catch (error) {
    handleError(res, error);
  }
};

// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required' });
    }

    // password has select:false, so ask for it explicitly
    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    sendAuthResponse(res, 200, user);
  } catch (error) {
    handleError(res, error);
  }
};

// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { registerCustomer, registerProvider, login, getMe };
