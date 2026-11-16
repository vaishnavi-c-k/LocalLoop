const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },

    bookingDate: {
      type: Date,
      required: true
    },

    timeSlot: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);