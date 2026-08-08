const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
 createGroup,
  getGroups,
  getGroupById,
  getInvites,
  acceptInvite,
  declineInvite,
  leaveGroup,
  getDeclinedInvites,
  dismissDeclined
} = require("../controllers/groupController");

// ➕ Create group
router.post("/create", authMiddleware, createGroup);

// 📩 Get my pending invites (must come before /:id so it doesn't get swallowed by that route)
router.get("/invites", authMiddleware, getInvites);

// ✅ Accept an invite
router.post("/invites/:groupId/accept", authMiddleware, acceptInvite);

// ❌ Decline an invite
router.post("/invites/:groupId/decline", authMiddleware, declineInvite);

// 📋 Get all groups
router.get("/", authMiddleware, getGroups);

// 🔥 Get single group by id
router.post("/:id/leave", authMiddleware, leaveGroup);
// 🔔 Get invites others declined for my groups
router.get("/declined-notifications", authMiddleware, getDeclinedInvites);

// ✅ Dismiss a declined-invite notification
router.post("/declined/:groupId/:userId/dismiss", authMiddleware, dismissDeclined);

// 🔥 Get single group by id
router.get("/:id", authMiddleware, getGroupById);

module.exports = router;
