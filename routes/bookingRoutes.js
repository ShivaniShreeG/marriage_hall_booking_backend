const express = require("express");
const { 
  createBooking, 
  getBookings, 
  getBookingById,
  updateBooking, 
  cancelBooking,
  getBookingHistory,
  getUserBookingHistory
} = require("../controllers/bookingController");

const router = express.Router();

// 🆕 Create a new booking
router.post("/create", createBooking);

// 📅 Get all bookings
router.get("/list", getBookings);

// ✅ Admin - all bookings history 
router.get("/history", getBookingHistory);

// ✅ User - own booking timeline
router.get("/history/user/:userId", getUserBookingHistory);

// ✏️ Update booking details
router.put("/update/:id", updateBooking);

// ❌ Cancel a booking
router.put("/cancel/:id", cancelBooking);

//get bookings by id 
router.get("/:id", getBookingById);

module.exports = router;
