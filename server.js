const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes"); // ✅ add this

dotenv.config();
const app = express();

// ✅ Enable CORS for all origins
app.use(cors({
  origin: "*", // Allow all origins
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
}));

// ✅ Middleware to parse JSON
app.use(express.json());

// ✅ Test API
app.get("/", (req, res) => {
  res.send("🚀 Marriage Hall Booking Backend is running...");
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes); // ✅ add booking routes

// ✅ Start Server on all network interfaces
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
