const Exhibitor = require("../models/Exhibitor");
const Application = require("../models/Application");
const Booth = require("../models/Booth");
const Notification = require("../models/Notification");
const User = require("../models/User");

/* ============================================================
   GET /api/exhibitors/me
   ============================================================ */
async function getMyProfile(req, res, next) {
  try {
    let exhibitor = await Exhibitor.findOne({ user: req.user._id }).populate(
      "user",
      "name email phone role isActive"
    );

    if (!exhibitor) {
      exhibitor = await Exhibitor.create({
        user: req.user._id,
        companyName: "",
        industry: "",
        description: "",
        logo: "",
        website: "",
        registrationNumber: "",
        establishedYear: null,
        companySize: "",
        country: "",
        city: "",
        address: "",
        socials: {},
      });
    }

    res.json({ success: true, exhibitor });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   PUT /api/exhibitors/me
   ============================================================ */
async function updateMyProfile(req, res, next) {
  try {
    const allowed = [
      "companyName", "industry", "description", "mission", "category",
      "logo", "website", "registrationNumber", "establishedYear", "companySize",
      "email", "phone", "altContact", "country", "city", "address", "socials",
    ];
    const update = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    });

    const exhibitor = await Exhibitor.findOneAndUpdate(
      { user: req.user._id },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    ).populate("user", "name email phone role");

    // Admin ko notification bhejo
    try {
      const admins = await User.find({ role: "admin" });
      const companyName = exhibitor.companyName || exhibitor.user?.name || "An exhibitor";
      
      const adminNotifs = admins.map(admin => ({
        user: admin._id,
        type: "system",
        title: "Company Profile Updated",
        message: `${companyName} has updated their company profile.`,
        link: "/organizer/exhibitors",
        read: false
      }));

      if (adminNotifs.length > 0) {
        await Notification.insertMany(adminNotifs);
      }
    } catch (notifErr) {
      console.error("Admin notification error:", notifErr);
    }

    res.json({ success: true, message: "Profile updated successfully.", exhibitor });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/exhibitors/me/dashboard
   ============================================================ */
async function getMyDashboard(req, res, next) {
  try {
    const exhibitor = await Exhibitor.findOne({ user: req.user._id });

    const [
      totalApplications, pendingApplications, approvedApplications, rejectedApplications,
      myBooths, recentApplications, unreadNotifications,
    ] = await Promise.all([
      Application.countDocuments({ exhibitor: req.user._id }),
      Application.countDocuments({ exhibitor: req.user._id, status: "pending" }),
      Application.countDocuments({ exhibitor: req.user._id, status: "approved" }),
      Application.countDocuments({ exhibitor: req.user._id, status: "rejected" }),
      Booth.find({ reservedBy: req.user._id }).populate("expoId", "title startDate endDate"),
      Application.find({ exhibitor: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("expoId", "title startDate endDate city"),
      Notification.countDocuments({ user: req.user._id, read: false }),
    ]);

    res.json({
      success: true,
      stats: {
        totalApplications, pendingApplications, approvedApplications, rejectedApplications,
        assignedBooths: myBooths.length, unreadNotifications,
      },
      exhibitor, myBooths, recentApplications,
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/exhibitors
   Public directory
   ============================================================ */
async function listExhibitors(req, res, next) {
  try {
    const filter = {};
    if (req.query.search) {
      filter.companyName = { $regex: req.query.search, $options: "i" };
    }
    if (req.query.industry) filter.industry = req.query.industry;

    const exhibitors = await Exhibitor.find(filter)
      .select(
        "companyName industry description logo website country city socials email phone address mission category"
      )
      .limit(100);

    res.json({ success: true, count: exhibitors.length, exhibitors });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/exhibitors/admin/all  [Admin Only]
   ============================================================ */
async function getAllExhibitors(req, res, next) {
  try {
    const exhibitors = await Exhibitor.find()
      .populate("user", "name email phone isVerifiedExhibitor createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: exhibitors.length, exhibitors });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/exhibitors/:id
   Single Exhibitor Detail (Public)
   ============================================================ */
async function getExhibitorById(req, res, next) {
  try {
    const exhibitor = await Exhibitor.findOne({ user: req.params.id })
      .populate("user", "name email phone isVerifiedExhibitor createdAt");

    if (!exhibitor) {
      // Fallback: Agar Exhibitor profile nahi bani, direct User se check karein
      const user = await User.findById(req.params.id).select("name email phone role isVerifiedExhibitor createdAt");
      if (!user || user.role !== "exhibitor") {
        return res.status(404).json({ success: false, message: "Exhibitor not found." });
      }
      return res.json({ success: true, exhibitor: { user, companyName: user.name } });
    }

    res.json({ success: true, exhibitor });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyDashboard,
  listExhibitors,
  getAllExhibitors, 
  getExhibitorById,
};