const express = require("express");
const { login, getAllUsers } = require("../controllers/authController"); // ✅ Import both functions

const router = express.Router();

// ✅ Login API
router.post("/login", login);

// ✅ Get all users API
router.get("/users", getAllUsers);

module.exports = router;
