const Booth = require("../models/Booth");
const Expo = require("../models/Expo");
const Application = require("../models/Application");

/* ============================================================
   GET /api/booths
   ============================================================ */
async function getAllBooths(req, res, next) {
  try {
    const { expoId, hall, status } = req.query;
    const filter = {};
    if (expoId) filter.expoId = expoId;
    if (hall) filter.hall = hall;
    if (status) filter.status = status;

    const booths = await Booth.find(filter)
      .populate("reservedBy", "name email companyName industry website")
      .sort({ "gridPosition.row": 1, "gridPosition.col": 1 })
      .lean();

    res.json({ success: true, booths });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/booths/:id
   ============================================================ */
async function getBoothById(req, res, next) {
  try {
    const booth = await Booth.findById(req.params.id)
      .populate("reservedBy", "name email companyName industry website")
      .populate("expoId", "title startDate endDate");

    if (!booth) return res.status(404).json({ success: false, message: "Booth not found" });
    res.json({ success: true, booth });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   🔥 FIXED: GET /api/booths/me (Exhibitor apna booth dekhe)
   ============================================================ */
async function getMyBooth(req, res, next) {
  try {
    const booth = await Booth.findOne({ reservedBy: req.user._id })
      .populate("reservedBy", "name email companyName industry website")
      // Expo details add ki hain taaki frontend par dates aur venue show ho
      .populate("expoId", "title startDate endDate location venue");

    if (!booth) {
      return res.status(404).json({ success: false, message: "Aapne abhi tak koi booth book nahi kiya hai." });
    }
    res.json({ success: true, booth });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   POST /api/booths/book/:id — Exhibitor booth reserve kare
   ============================================================ */
async function bookBooth(req, res, next) {
  try {
    const booth = await Booth.findById(req.params.id);
    if (!booth) return res.status(404).json({ success: false, message: "Booth not found" });
    
    if (booth.status !== "Available") {
      return res.status(400).json({ success: false, message: "Yeh booth pehle se reserved ya booked hai." });
    }

    // Check application approved
    const application = await Application.findOne({ 
      exhibitor: req.user._id, 
      expoId: booth.expoId,
      status: "approved" 
    });

    if (!application) {
      return res.status(403).json({ success: false, message: "Aapki is expo ke liye application approved nahi hai." });
    }

    booth.status = "Reserved"; 
    booth.reservedBy = req.user._id;
    await booth.save();

    res.json({ success: true, message: "Booth successfully requested!", booth });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   🔥 ADMIN: GET /api/booths/requests — Saari reserved requests
   ============================================================ */
async function getBoothRequests(req, res, next) {
  try {
    const requests = await Booth.find({ status: "Reserved" })
      .populate("reservedBy", "name email companyName phone")
      .populate("expoId", "title location")
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   🔥 ADMIN: PATCH /api/booths/requests/:id — Approve/Reject
   ============================================================ */
async function handleBoothRequest(req, res, next) {
  try {
    const { action } = req.body; // "approve" or "reject"
    const booth = await Booth.findById(req.params.id);
    
    if (!booth) return res.status(404).json({ success: false, message: "Booth not found" });

    if (action === "approve") {
      booth.status = "Booked"; 
    } else if (action === "reject") {
      booth.status = "Available"; 
      booth.reservedBy = null;
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    await booth.save();
    res.json({ success: true, message: `Booth request ${action}d successfully`, booth });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   Baaki purane functions
   ============================================================ */
async function createBooth(req, res, next) {
  try {
    const booth = await Booth.create(req.body);
    res.status(201).json({ success: true, booth });
  } catch (err) { next(err); }
}

async function updateBooth(req, res, next) {
  try {
    const booth = await Booth.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!booth) return res.status(404).json({ success: false, message: "Booth not found" });
    res.json({ success: true, booth });
  } catch (err) { next(err); }
}

async function deleteBooth(req, res, next) {
  try {
    const booth = await Booth.findByIdAndDelete(req.params.id);
    if (!booth) return res.status(404).json({ success: false, message: "Booth not found" });
    res.json({ success: true, message: "Booth deleted" });
  } catch (err) { next(err); }
}

async function getBoothsByExpo(req, res, next) {
  try {
    const booths = await Booth.find({ expoId: req.params.expoId })
      .populate("reservedBy", "name email companyName industry website")
      .sort({ "gridPosition.row": 1, "gridPosition.col": 1 })
      .lean();
    res.json({ success: true, booths });
  } catch (err) { next(err); }
}

module.exports = {
  getAllBooths,
  getBoothById,
  getBoothsByExpo,
  getMyBooth,
  bookBooth,
  createBooth,
  updateBooth,
  deleteBooth,
  getBoothRequests,
  handleBoothRequest,
};