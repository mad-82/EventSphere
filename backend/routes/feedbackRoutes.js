const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
} = require("../controllers/feedbackController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Sab users (Attendee + Exhibitor) feedback de sakte hain
router.use(protect);

router.get("/me", getMyFeedback);
router.post("/", submitFeedback);

// Admin ko sab dikhegi
router.get("/", authorize("admin", "organizer"), getAllFeedback);

module.exports = router;