const express = require("express");
const router = express.Router();

const {
  getOverview,
  getRegistrationTrend,
  getApplicationAnalytics,
  getBoothOccupancy,
  getSessionPopularity,
  getEventComparison,
  getAllAnalytics,
  getDashboardData,
} = require("../controllers/analyticsController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All analytics endpoints require login + organizer/admin role
router.use(protect, authorize("admin", "organizer"));

/* ============ Existing Analytics Page Routes ============ */
router.get("/all", getAllAnalytics);
router.get("/overview", getOverview);
router.get("/registrations-trend", getRegistrationTrend);
router.get("/application-analytics", getApplicationAnalytics);
router.get("/booth-occupancy", getBoothOccupancy);
router.get("/session-popularity", getSessionPopularity);
router.get("/event-comparison", getEventComparison);

/* ============ Organizer Dashboard (single call) ============ */
router.get("/dashboard", getDashboardData);

module.exports = router;