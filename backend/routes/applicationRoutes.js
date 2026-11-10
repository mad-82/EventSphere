const express = require("express");
const router = express.Router();
const {
  getMyApplications,
  getApplicationById,
  createApplication,
  withdrawApplication,
  updateApplicationStatus,
  getAllApplications, // ✅ Import karo
} = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Exhibitor
router.get("/me", protect, authorize("exhibitor"), getMyApplications);
router.post("/", protect, authorize("exhibitor"), createApplication);
router.delete("/:id", protect, authorize("exhibitor"), withdrawApplication);

// ✅ Admin - Get All Applications (Ise ":id" se PEHLE rakhna zaroori hai)
router.get("/", protect, authorize("organizer", "admin"), getAllApplications);

// Shared — ownership inside controller
router.get("/:id", protect, getApplicationById);

// Admin-only
router.put(
  "/:id/status",
  protect,
  authorize("organizer", "admin"),
  updateApplicationStatus
);

module.exports = router;