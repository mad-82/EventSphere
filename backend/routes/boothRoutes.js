const express = require("express");
const router = express.Router();
const boothController = require("../controllers/boothController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Public routes
router.get("/", boothController.getAllBooths);
router.get("/expo/:expoId", boothController.getBoothsByExpo);

// ==========================================
// 🔥 Static routes (Hamesha /:id se PEHLE)
// ==========================================
router.get("/me", protect, boothController.getMyBooth);
router.post("/book/:id", protect, authorize("exhibitor"), boothController.bookBooth);

// Admin Requests
router.get("/requests", protect, authorize("organizer", "admin"), boothController.getBoothRequests);
router.patch("/requests/:id", protect, authorize("organizer", "admin"), boothController.handleBoothRequest);
// ==========================================

// Dynamic ID route
router.get("/:id", boothController.getBoothById);

// Protected routes
router.post("/", protect, authorize("organizer", "admin"), boothController.createBooth);
router.patch("/:id", protect, authorize("organizer", "admin"), boothController.updateBooth);
router.delete("/:id", protect, authorize("organizer", "admin"), boothController.deleteBooth);

module.exports = router;