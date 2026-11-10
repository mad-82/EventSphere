const Notification = require("../models/Notification");

/* GET /api/notifications — logged-in user ke notifications */
async function getMyNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, count: notifications.length, notifications });
  } catch (err) {
    next(err);
  }
}

/* PATCH /api/notifications/:id/read — ek notification read mark */
async function markRead(req, res, next) {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found." });
    }
    if (String(notif.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }
    notif.read = true;
    await notif.save();
    res.json({ success: true, message: "Marked as read.", notification: notif });
  } catch (err) {
    next(err);
  }
}

/* PATCH /api/notifications/read-all */
async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
}

/* DELETE /api/notifications/:id */
async function deleteNotification(req, res, next) {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found." });
    }
    if (String(notif.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notification deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyNotifications,
  markRead,
  markAllRead,
  deleteNotification,
};