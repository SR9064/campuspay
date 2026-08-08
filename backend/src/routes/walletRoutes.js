const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getBalance,
  transfer,
  addMoney,
  getHistory
} = require("../controllers/walletController");

// 💰 wallet routes
router.post("/add-money", authMiddleware, addMoney);
router.get("/balance", authMiddleware, getBalance);
router.post("/transfer", authMiddleware, transfer);
router.get("/history", authMiddleware, getHistory);

module.exports = router;