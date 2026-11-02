const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => {
  try {
    const { studioId, date, startTime, endTime, totalPrice } = req.body;
    const userId = req.user.id;

    if (!studioId || !date || !startTime || !endTime || !totalPrice) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingBooking = await Booking.findOne({
      studioId,
      date,
      status: { $ne: "cancelled" },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "This studio is already booked for the selected time slot."
      });
    }

    const newBooking = new Booking({
      studioId,
      userId,
      date,
      startTime,
      endTime,
      totalPrice,
      status: "confirmed"
    });

    await newBooking.save();

    return res.status(201).json({
      message: "Studio booked successfully!",
      booking: newBooking
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ userId }).populate("studioId");
    return res.status(200).json({ bookings });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOneAndDelete({ _id: id, userId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or unauthorized" });
    }

    return res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};