const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const attendeeController = require("../controllers/attendeeController");

/* ============================================================
   PUBLIC ROUTES (Bina Login ke accessible)
   ============================================================ */
router.post("/contact", attendeeController.sendContactEmail);
router.post("/feedback-guest", attendeeController.submitGuestFeedback);

/* ============================================================
   PROTECTED ROUTES (Login zaroori hai)
   ============================================================ */
router.get("/dashboard", protect, authorize("attendee"), attendeeController.getDashboard);
router.get("/schedule", protect, authorize("attendee"), attendeeController.getSchedule);
router.post("/feedback", protect, authorize("attendee"), attendeeController.submitFeedback);

/* Organizer Routes for Attendees */
router.get("/all", protect, authorize("admin", "organizer"), attendeeController.getAllAttendees);
router.patch("/:id/check-in", protect, authorize("admin", "organizer"), attendeeController.checkInAttendee);
router.patch("/:id/undo-check-in", protect, authorize("admin", "organizer"), attendeeController.undoCheckIn);
router.patch("/:id/cancel", protect, authorize("admin", "organizer"), attendeeController.cancelRegistration);

module.exports = router;