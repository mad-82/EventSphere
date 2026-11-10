const Application = require("../models/Application");
const Exhibitor = require("../models/Exhibitor");
const Booth = require("../models/Booth");
const Notification = require("../models/Notification");
const Expo = require("../models/Expo");

/* ============================================================
   GET /api/applications  [Admin Only]
   Saari applications fetch karo (populate exhibitor & expo)
   ============================================================ */
async function getAllApplications(req, res, next) {
  try {
    const applications = await Application.find()
      .populate("exhibitor", "name email phone")
      .populate("expoId", "title startDate endDate")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    next(err);
  }
}
/* ============================================================
   GET /api/applications/me
   Exhibitor apni applications dekhe (with expo info)
   ============================================================ */
async function getMyApplications(req, res, next) {
  try {
    const filter = { exhibitor: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const applications = await Application.find(filter)
      .populate("expoId", "title startDate endDate city venue coverImage")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/applications/:id
   Single application detail (ownership check)
   ============================================================ */
async function getApplicationById(req, res, next) {
  try {
    const app = await Application.findById(req.params.id)
      .populate("expoId")
      .populate("exhibitor", "name email companyName");

    if (!app) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    // Exhibitor sirf apni application dekh sakta hai; admin sab dekh sakta hai
    if (
      req.user.role === "exhibitor" &&
      String(app.exhibitor._id) !== String(req.user._id)
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    res.json({ success: true, application: app });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   POST /api/applications
   Exhibitor naya application submit kare
   ============================================================ */
async function createApplication(req, res, next) {
  try {
    const { expoId, boothType, boothSize, staffCount, products, services, notes, documents } =
      req.body;

    if (!expoId) {
      return res
        .status(400)
        .json({ success: false, message: "expoId is required." });
    }

    // Expo exist karta hai?
    const expo = await Expo.findById(expoId);
    if (!expo) {
      return res
        .status(404)
        .json({ success: false, message: "Expo not found." });
    }

    // Duplicate — same expo ke liye pending/approved already hai?
    const dupe = await Application.findOne({
      exhibitor: req.user._id,
      expoId,
      status: { $in: ["pending", "approved"] },
    });
    if (dupe) {
      return res.status(400).json({
        success: false,
        message: `You already have an active application (${dupe._id}) for this expo.`,
      });
    }

    const application = await Application.create({
      exhibitor: req.user._id,
      expoId,
      status: "pending",
      boothType: boothType || "",
      boothSize: boothSize || "",
      staffCount: staffCount || 0,
      products: products || [],
      services: services || [],
      notes: notes || "",
      documents: documents || [],
    });

    // Notification create karo
    await Notification.create({
      user: req.user._id,
      type: "application",
      title: "Application submitted",
      message: `Your application for ${expo.title} has been submitted.`,
      link: "/exhibitor/my-applications",
      read: false,
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      application,
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   DELETE /api/applications/:id
   Exhibitor pending application withdraw kare
   ============================================================ */
async function withdrawApplication(req, res, next) {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }
    if (String(app.exhibitor) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }
    if (app.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending applications can be withdrawn.",
      });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Application withdrawn." });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   PUT /api/applications/:id/status   [Admin only]
   Admin approve/reject kare + notification bheje
   ============================================================ */
async function updateApplicationStatus(req, res, next) {
  try {
    const { status, rejectionReason } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status." });
    }

    const app = await Application.findById(req.params.id).populate(
      "expoId",
      "title"
    );
    if (!app) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    app.status = status;
    if (status === "rejected") app.rejectionReason = rejectionReason || "";
    await app.save();

    // Notification
    await Notification.create({
      user: app.exhibitor,
      type: "application",
      title: `Application ${status}`,
      message: `Your application for ${app.expoId?.title || "expo"} has been ${status}.`,
      link: "/exhibitor/my-applications",
      read: false,
    });

    res.json({ success: true, message: `Application ${status}.`, application: app });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyApplications,
  getApplicationById,
  createApplication,
  withdrawApplication,
  updateApplicationStatus,
  getAllApplications,
};