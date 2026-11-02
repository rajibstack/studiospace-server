const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  cancelBooking
} = require("../controllers/bookingController");
const verifyToken = require("../middleware/verifyToken");

router.post("/", verifyToken, createBooking);
router.get("/my-bookings", verifyToken, getUserBookings);
router.delete("/:id", verifyToken, cancelBooking);

module.exports = router;