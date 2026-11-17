
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Booking = require("../models/Booking");

// Submit a customer review
const createReview = async (req, res) => {
  try {
    const { provider, booking, rating, comment } = req.body;

    if (!provider || !booking || rating === undefined || !comment) {
      return res.status(400).json({
        success: false,
        message: "Provider, booking, rating and comment are required"
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(provider) ||
      !mongoose.Types.ObjectId.isValid(booking)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider or booking ID"
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5"
      });
    }

    if (
      typeof comment !== "string" ||
      comment.trim().length < 5 ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "Comment must contain between 5 and 1000 characters"
      });
    }

    const customerId = req.user?._id || req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const existingBooking = await Booking.findById(booking);

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (
      existingBooking.customerId.toString() !==
      customerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot review another customer's booking"
      });
    }

    if (existingBooking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed bookings can be reviewed"
      });
    }

    if (
      existingBooking.providerId.toString() !==
      provider.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Provider does not match this booking"
      });
    }

    const existingReview = await Review.findOne({ booking });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "A review already exists for this booking"
      });
    }

    const review = await Review.create({
      customer: customerId,
      provider,
      booking,
      rating: numericRating,
      comment: comment.trim()
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A review already exists for this booking"
      });
    }

    console.error("Review submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit review"
    });
  }
};


// Get all reviews for a provider
const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID"
      });
    }

    const reviews = await Review.find({ provider: providerId })
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating = totalReviews
      ? reviews.reduce(
          (total, review) => total + review.rating,
          0
        ) / totalReviews
      : 0;

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    return res.status(200).json({
      success: true,
      providerId,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      ratingDistribution,
      reviews
    });

  } catch (error) {
    console.error("Provider reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch provider reviews"
    });
  }
};


// Get reviews submitted by the logged-in customer
const getCustomerReviews = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const reviews = await Review.find({ customer: customerId })
      .populate("provider", "name")
      .populate({
        path: "booking",
        populate: {
          path: "serviceId",
          select: "name title"
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalReviews: reviews.length,
      reviews
    });

  } catch (error) {
    console.error("Customer reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer reviews"
    });
  }
};


// Get all reviews for the Admin Dashboard
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customer", "name email")
      .populate("provider", "name email")
      .populate({
        path: "booking",
        populate: {
          path: "serviceId",
          select: "name title"
        }
      })
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating = totalReviews > 0
      ? reviews.reduce(
          (total, review) => total + review.rating,
          0
        ) / totalReviews
      : 0;

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    const positiveReviews = reviews.filter(
      (review) => review.rating >= 4
    ).length;

    return res.status(200).json({
      success: true,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      positiveReviews,
      ratingDistribution,
      reviews
    });

  } catch (error) {
    console.error("Get all reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve all reviews"
    });
  }
};


module.exports = {
  createReview,
  getProviderReviews,
  getCustomerReviews,
  getAllReviews
};
