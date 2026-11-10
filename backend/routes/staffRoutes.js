const express = require("express");
const router = express.Router();
const { getMyStaff, createStaff, updateStaff, deleteStaff } = require("../controllers/staffController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect, authorize("exhibitor"));

router.get("/", getMyStaff);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

module.exports = router;