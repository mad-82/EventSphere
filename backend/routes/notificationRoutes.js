const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyNotifications);
router.patch("/read-all", protect, markAllRead);
router.patch("/:id/read", protect, markRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;