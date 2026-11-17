
const express = require("express");
const router = express.Router();

const {
  createReview,
  getProviderReviews,
  getCustomerReviews,
  getAllReviews
} = require("../controllers/reviewController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

// Customer: Submit a review
router.post(
  "/",
  protect,
  authorize("customer"),
  createReview
);

// Customer: Get their own reviews
router.get(
  "/my",
  protect,
  authorize("customer"),
  getCustomerReviews
);

// Provider: Get reviews and ratings
router.get(
  "/provider/:providerId",
  getProviderReviews
);

// Admin: Get all reviews
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllReviews
);

module.exports = router;
