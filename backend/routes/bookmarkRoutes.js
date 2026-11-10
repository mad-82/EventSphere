const express = require("express");
const router = express.Router();
const { toggleBookmark, getMyBookmarks } = require("../controllers/bookmarkController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Sirf logged-in users hi bookmark kar sakte hain
router.get("/", protect, getMyBookmarks);
router.post("/:sessionId", protect, authorize("attendee"), toggleBookmark);

module.exports = router;