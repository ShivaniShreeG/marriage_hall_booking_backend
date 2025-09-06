const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const CONFIG = require("./config/config"); // ✅ Import the config file

const app = express();

// ✅ Enable CORS
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
}));

// ✅ Middleware
app.use(express.json());

// ✅ Test API
app.get("/", (req, res) => {
  res.send("🚀 Marriage Hall Booking Backend is running...");
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// ✅ Start Server
app.listen(CONFIG.PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${CONFIG.PORT}`);
});
