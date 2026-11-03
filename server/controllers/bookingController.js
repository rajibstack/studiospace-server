const { ObjectId } = require("mongodb");

exports.createBooking = async (req, res) => {
  try {
    const { studioId, studioTitle, date, hours, totalPrice, userEmail, userName } = req.body;

    const finalEmail = req.user?.email || userEmail;
    const finalUserId = req.user?.id || req.user?._id;

    if (!studioId || !date || !totalPrice) {
      return res.status(400).json({ message: "Studio ID, date, and total price are required." });
    }

    if (!finalEmail) {
      return res.status(400).json({ message: "User email is required for booking." });
    }

    const db = req.app.locals.db;
    const bookingsCollection = db.collection("bookings");

    let formattedStudioId;
    try {
      formattedStudioId = new ObjectId(studioId);
    } catch (e) {
      formattedStudioId = studioId;
    }

    const newBooking = {
      studioId: formattedStudioId,
      studioTitle: studioTitle || "Studio Session",
      userEmail: finalEmail,
      userName: userName || "Guest User",
      userId: finalUserId ? (ObjectId.isValid(finalUserId) ? new ObjectId(finalUserId) : finalUserId) : null,
      date,
      hours: Number(hours) || 1,
      totalPrice: Number(totalPrice),
      status: "Pending", 
      createdAt: new Date(),
    };

    const result = await bookingsCollection.insertOne(newBooking);

    return res.status(201).json({
      success: true,
      message: "Studio booked successfully!",
      booking: { ...newBooking, _id: result.insertedId },
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userEmail = req.user?.email || req.query.email;
    const userId = req.user?.id;

    const db = req.app.locals.db;

    let query = {};
    if (userEmail) {
      query = { userEmail: userEmail };
    } else if (userId && ObjectId.isValid(userId)) {
      query = { userId: new ObjectId(userId) };
    } else {
      return res.status(400).json({ message: "User identification missing" });
    }

    const bookings = await db.collection("bookings").find(query).sort({ createdAt: -1 }).toArray();

    return res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const db = req.app.locals.db;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const result = await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "Cancelled", updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};