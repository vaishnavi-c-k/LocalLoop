const express = require("express");
const router = express.Router();

const {
    createBooking,
    getMyBookings,
    getProviderBookings,
    updateBookingStatus,
    cancelBooking
} = require("../controllers/bookingController");

// Create a booking
router.post("/", createBooking);

// Customer booking history
router.get("/customer/:customerId", getMyBookings);

// Provider booking requests
router.get("/provider/:providerId", getProviderBookings);

// Accept or reject booking
router.patch("/:bookingId/status", updateBookingStatus);

// Cancel booking
router.patch("/:bookingId/cancel", cancelBooking);

module.exports = router;