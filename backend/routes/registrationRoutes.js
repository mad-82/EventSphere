const express = require("express");
const router = express.Router();
const { bookTicket, getMyTickets } = require("../controllers/registrationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/", protect, authorize("attendee"), bookTicket);
router.get("/my-tickets", protect, getMyTickets);

module.exports = router;