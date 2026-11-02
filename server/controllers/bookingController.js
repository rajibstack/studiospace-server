const { ObjectId } = require("mongodb");

exports.createBooking = async (req, res) => {
  try {
    const { studioId, date, startTime, endTime, totalPrice } = req.body;
    const userId = req.user.id;

    if (!studioId || !date || !startTime || !endTime || !totalPrice) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const db = req.app.locals.db;
    const bookingsCollection = db.collection("bookings");

    const existingBooking = await bookingsCollection.findOne({
      studioId,
      date,
      status: { $ne: "cancelled" },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "This studio is already booked for the selected time slot.",
      });
    }

    const newBooking = {
      studioId: new ObjectId(studioId),
      userId: new ObjectId(userId),
      date,
      startTime,
      endTime,
      totalPrice,
      status: "confirmed",
      createdAt: new Date(),
    };

    const result = await bookingsCollection.insertOne(newBooking);

    return res.status(201).json({
      message: "Studio booked successfully!",
      booking: { ...newBooking, _id: result.insertedId },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = req.app.locals.db;

    const bookings = await db.collection("bookings").aggregate([
      { $match: { userId: new ObjectId(userId) } },
      {
        $lookup: {
          from: "studios",
          localField: "studioId",
          foreignField: "_id",
          as: "studioId",
        },
      },
      { $unwind: "$studioId" },
    ]).toArray();

    return res.status(200).json({ bookings });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const db = req.app.locals.db;

    const result = await db.collection("bookings").deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Booking not found or unauthorized" });
    }

    return res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};