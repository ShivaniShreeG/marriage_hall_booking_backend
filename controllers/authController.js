const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db"); // ✅ DB connection
const CONFIG = require("../config/config");  
// ✅ Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 🔹 Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and role are required",
      });
    }

    // 🔹 Find user by email
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 🔹 Check role matches
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized: You are not a ${role}`,
      });
    }

    // 🔹 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 🔹 Generate JWT (use CONFIG instead of process.env)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      CONFIG.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ✅ Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT * FROM users");

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("❌ Get Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};
