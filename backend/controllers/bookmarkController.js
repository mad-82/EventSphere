const Bookmark = require("../models/Bookmark");

// Toggle Bookmark (Agar pehle se hai toh hata do, warna add kar do)
async function toggleBookmark(req, res, next) {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const existing = await Bookmark.findOne({ userId, sessionId });
    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.json({ success: true, bookmarked: false, message: "Bookmark removed." });
    }

    const bookmark = await Bookmark.create({ userId, sessionId });
    res.status(201).json({ success: true, bookmarked: true, message: "Session bookmarked.", bookmark });
  } catch (err) {
    next(err);
  }
}

// Get logged-in user ke saare bookmarks
async function getMyBookmarks(req, res, next) {
  try {
    // Populate taake session ki details bhi mil jayein
    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .populate("sessionId", "title speaker date startTime endTime room");
    res.json({ success: true, bookmarks });
  } catch (err) {
    next(err);
  }
}

module.exports = { toggleBookmark, getMyBookmarks };