const express = require("express");
const router = express.Router();
const { listSessions, createSession, deleteSession, updateSession } = require("../controllers/scheduleController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Public route to see schedule
router.get("/", listSessions);

// Admin routes to manage schedule
router.post("/", protect, authorize("organizer"), createSession);
router.delete("/:id", protect, authorize("organizer"), deleteSession);
router.put("/:id", protect, authorize("organizer"), updateSession);

module.exports = router;