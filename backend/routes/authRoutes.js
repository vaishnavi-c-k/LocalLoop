const express = require('express');
const {
  registerCustomer,
  registerProvider,
  login,
  getMe,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register/customer', registerCustomer);
router.post('/register/provider', registerProvider);
router.post('/login', login);
router.get('/me', protect, getMe);

// Role-protection demos: use these to verify protect/authorize work.
// Remove them (or copy the pattern) once real feature routes exist.
router.get('/customer-area', protect, authorize('customer'), (req, res) =>
  res.json({ success: true, message: `Hello customer ${req.user.name}`, userId: req.user._id })
);
router.get('/provider-area', protect, authorize('provider'), (req, res) =>
  res.json({ success: true, message: `Hello provider ${req.user.name}`, userId: req.user._id })
);

module.exports = router;
