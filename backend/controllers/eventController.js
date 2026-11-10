const Expo = require("../models/Expo");

// 1. List saare expos
async function listExpos(req, res, next) {
  try {
    const expos = await Expo.find().sort({ createdAt: -1 });
    res.json({ success: true, count: expos.length, expos });
  } catch (err) {
    next(err);
  }
}

// 2. Get single expo by ID (Detail Page ke liye zaroori)
async function getExpo(req, res, next) {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) {
      return res.status(404).json({ success: false, message: "Expo not found." });
    }
    res.json({ success: true, expo });
  } catch (err) {
    next(err);
  }
}

// 3. Create naya expo
async function createExpo(req, res, next) {
  try {
    const { title, description, startDate, endDate, location, venue, category, registrationStart, registrationEnd, maxAttendees } = req.body;

    if (!title || !startDate || !endDate || !location) {
      return res.status(400).json({ success: false, message: "Required fields missing." });
    }

    const expo = await Expo.create({
      ...req.body,
      maxAttendees: Number(maxAttendees),
      createdBy: req.user ? req.user._id : null
    });

    res.status(201).json({ success: true, message: "Expo created successfully.", expo });
  } catch (err) {
    next(err);
  }
}

// 4. Update Expo
async function updateExpo(req, res, next) {
  try {
    const expo = await Expo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!expo) {
      return res.status(404).json({ success: false, message: "Expo not found." });
    }
    res.json({ success: true, message: "Expo updated.", expo });
  } catch (err) {
    next(err);
  }
}

// 5. Delete Expo
async function deleteExpo(req, res, next) {
  try {
    const expo = await Expo.findByIdAndDelete(req.params.id);
    if (!expo) {
      return res.status(404).json({ success: false, message: "Expo not found." });
    }
    res.json({ success: true, message: "Expo deleted." });
  } catch (err) {
    next(err);
  }
}

// 6. Toggle Publish Status
async function togglePublish(req, res, next) {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) {
      return res.status(404).json({ success: false, message: "Expo not found." });
    }
    expo.status = expo.status === "Published" ? "Draft" : "Published";
    await expo.save();
    res.json({ success: true, message: `Expo ${expo.status.toLowerCase()}.`, expo });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  listExpos, 
  getExpo, 
  createExpo, 
  updateExpo, 
  deleteExpo, 
  togglePublish 
};