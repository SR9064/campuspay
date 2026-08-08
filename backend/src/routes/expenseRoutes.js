const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const controller = require("../controllers/expenseController");

// ➕ Add expense (goes in as pending)
router.post("/add", authMiddleware, controller.addExpense);

// 📩 Get my pending approvals
router.get("/pending", authMiddleware, controller.getPendingExpenses);

// ✅ Approve an expense split
router.post("/approve/:expenseId", authMiddleware, controller.approveExpense);

// ❌ Reject an expense split
router.post("/reject/:expenseId", authMiddleware, controller.rejectExpense);
// 🔔 Get rejected-expense notifications
router.get("/rejected-notifications", authMiddleware, controller.getRejectedExpenses);

// ✅ Dismiss a rejected-expense notification
router.post("/rejected/:expenseId/dismiss", authMiddleware, controller.dismissRejected);

// 📊 Dashboard
router.get("/dashboard", authMiddleware, controller.getDashboard);

// 📊 Group dashboard
router.get("/group-dashboard/:groupId", authMiddleware, controller.getGroupDashboard);

// 📊 Settlement
router.get("/settle/:groupId", authMiddleware, controller.getGroupSettlement);

// 💸 Settle up
router.post("/settle-up", authMiddleware, controller.settleUp);

// 📜 Expense history
router.get("/history/:groupId", authMiddleware, controller.getGroupExpenses);

module.exports = router;
