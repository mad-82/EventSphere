const Staff = require("../models/Staff");

// Get all staff for logged-in exhibitor
async function getMyStaff(req, res, next) {
  try {
    const staff = await Staff.find({ exhibitor: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: staff.length, staff });
  } catch (err) {
    next(err);
  }
}

// Create staff member
async function createStaff(req, res, next) {
  try {
    const { name, designation, role, email, phone } = req.body;
    if (!name || !designation || !email || !phone) {
      return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }
    const staff = await Staff.create({
      exhibitor: req.user._id,
      name, designation, role, email, phone,
    });
    res.status(201).json({ success: true, message: "Staff member added.", staff });
  } catch (err) {
    next(err);
  }
}

// Update staff member
async function updateStaff(req, res, next) {
  try {
    const staff = await Staff.findOneAndUpdate(
      { _id: req.params.id, exhibitor: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found." });
    res.json({ success: true, message: "Staff updated.", staff });
  } catch (err) {
    next(err);
  }
}

// Delete staff member
async function deleteStaff(req, res, next) {
  try {
    const staff = await Staff.findOneAndDelete({ _id: req.params.id, exhibitor: req.user._id });
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found." });
    res.json({ success: true, message: "Staff member removed." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyStaff, createStaff, updateStaff, deleteStaff };