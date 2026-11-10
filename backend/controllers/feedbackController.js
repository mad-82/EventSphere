const Feedback = require("../models/Feedback");

/* ============================================================
   POST /api/feedback
   Submit new feedback (Attendee/Exhibitor)
   ============================================================ */
async function submitFeedback(req, res, next) {
  try {
    const { expoId, rating, comment, type } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: "Comment is required." });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      expoId: expoId || null,
      rating: Number(rating) || 0,
      comment: comment.trim(),
      type: type || "event",
    });

    res.status(201).json({ success: true, message: "Feedback submitted.", feedback });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/feedback/me
   Logged-in user ki apni feedback
   ============================================================ */
async function getMyFeedback(req, res, next) {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .populate("expoId", "title")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: feedback.length, feedback });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/feedback  [Admin Only]
   Saari feedback
   ============================================================ */
async function getAllFeedback(req, res, next) {
  try {
    const feedback = await Feedback.find()
      .populate("user", "name email role")
      .populate("expoId", "title")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: feedback.length, feedback });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
};