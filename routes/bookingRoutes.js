const express = require("express");
const { 
  createBooking, 
  getBookings, 
  updateBooking, 
  cancelBooking 
} = require("../controllers/bookingController");

const router = express.Router();

// 🆕 Create a new booking
router.post("/create", createBooking);

// 📅 Get all bookings
router.get("/list", getBookings);

// ✏️ Update booking details
router.put("/update/:id", updateBooking);

// ❌ Cancel a booking
router.put("/cancel/:id", cancelBooking);

module.exports = router;
