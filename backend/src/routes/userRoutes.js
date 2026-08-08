const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

/* ===== GET CURRENT USER ===== */

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("name email");

    res.json({
      userId: user._id,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ===== GET ALL USERS (FOR UI SELECTION) ===== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, "name email"); // no password

    res.json({ users });
  } catch (err) {
    console.error("USER FETCH ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;