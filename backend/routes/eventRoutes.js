const express = require("express");
const router = express.Router();
const {
  listExpos,
  getExpo,
  createExpo,
  updateExpo,
  deleteExpo,
  togglePublish,
} = require("../controllers/eventController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Public routes
router.get("/", listExpos);
router.get("/:id", getExpo); // <-- Ye line missing thi, ab add ho gayi hai

// Protected routes (Admin/Organizer)
router.post("/", protect, authorize("organizer"), createExpo);
router.put("/:id", protect, authorize("organizer"), updateExpo);
router.delete("/:id", protect, authorize("organizer"), deleteExpo);
router.patch("/:id/publish", protect, authorize("organizer"), togglePublish);

module.exports = router;