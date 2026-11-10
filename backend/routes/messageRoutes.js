const express = require("express");
const router = express.Router();
const {
  getMyConversations,
  createConversation,
  replyToConversation,
  getAllConversations,
  adminReply,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Admin Routes
router.get("/admin/all", protect, authorize("organizer", "admin"), getAllConversations);
router.post("/admin/:id/reply", protect, authorize("organizer", "admin"), adminReply);

// Attendee + Exhibitor (dono ke liye common)
router.use(protect, authorize("exhibitor", "attendee"));
router.get("/", getMyConversations);
router.post("/", createConversation);
router.post("/:id/reply", replyToConversation);

module.exports = router;