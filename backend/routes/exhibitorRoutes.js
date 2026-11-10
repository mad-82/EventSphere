const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  getMyDashboard,
  listExhibitors,
  getAllExhibitors,
  getExhibitorById,
} = require("../controllers/exhibitorController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Public directory
router.get("/", listExhibitors);

// Admin only
router.get("/admin/all", protect, authorize("organizer", "admin"), getAllExhibitors);

// ✅ Single Exhibitor Detail (Route order important hai, /me se pehle aana chahiye)
router.get("/:id", getExhibitorById);

// Exhibitor-only
router.get("/me", protect, authorize("exhibitor"), getMyProfile);
router.put("/me", protect, authorize("exhibitor"), updateMyProfile);
router.get("/me/dashboard", protect, authorize("exhibitor"), getMyDashboard);

module.exports = router;