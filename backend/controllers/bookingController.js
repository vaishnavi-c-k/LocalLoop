const Booking = require("../models/booking");

// Create a new booking
const createBooking = async (req, res) => {
    try {
        const {
            customerId,
            providerId,
            serviceId,
            bookingDate,
            timeSlot,
            address
        } = req.body;

        // Check required fields
        if (
            !customerId ||
            !providerId ||
            !serviceId ||
            !bookingDate ||
            !timeSlot ||
            !address
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Create booking
        const booking = new Booking({
            customerId,
            providerId,
            serviceId,
            bookingDate,
            timeSlot,
            address
        });

        // Save booking to MongoDB
        await booking.save();

        return res.status(201).json({
            message: "Booking created successfully",
            booking
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to create booking",
            error: error.message
        });
    }
};
// Get all bookings made by a customer
const getMyBookings = async (req, res) => {
    try {
        const { customerId } = req.params;

        const bookings = await Booking.find({ customerId })
            .populate("providerId")
            .populate("serviceId");

        res.status(200).json({
            count: bookings.length,
            bookings
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch bookings",
            error: error.message
        });
    }
};
// Get all booking requests received by a provider
const getProviderBookings = async (req, res) => {
    try {
        const { providerId } = req.params;

        const bookings = await Booking.find({ providerId })
            .populate("customerId")
            .populate("serviceId");

        res.status(200).json({
            count: bookings.length,
            bookings
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch provider bookings",
            error: error.message
        });
    }
};
// Accept or reject a booking
const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be accepted or rejected"
            });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (booking.status !== "pending") {
            return res.status(400).json({
                message: "Only pending bookings can be updated"
            });
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({
            message: `Booking ${status} successfully`,
            booking
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update booking",
            error: error.message
        });
    }
};
// Cancel a booking
const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (!["pending", "accepted"].includes(booking.status)) {
            return res.status(400).json({
                message: "This booking cannot be cancelled"
            });
        }

        booking.status = "cancelled";
        await booking.save();

        res.status(200).json({
            message: "Booking cancelled successfully",
            booking
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to cancel booking",
            error: error.message
        });
    }
};

module.exports = { createBooking, getMyBookings, getProviderBookings, updateBookingStatus, cancelBooking };