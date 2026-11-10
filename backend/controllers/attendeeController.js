const AttendeeRegistration = require("../models/AttendeeRegistration");
const Session = require("../models/Session");
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification");
const Expo = require("../models/Expo"); // 🔥 Upcoming Expos ke liye
const User = require("../models/User"); 
const nodemailer = require("nodemailer");

/* ============================================================
   GET /api/attendee/dashboard
   ============================================================ */
async function getDashboard(req, res, next) {
  try {
    console.log("🔥🔥🔥 DASHBOARD API HIT 🔥🔥🔥");

    // 1. Registrations
    const registrations = await AttendeeRegistration.find({ userId: req.user._id })
      .populate("expoId", "title startDate endDate location cover");

    console.log("Registrations Found:", registrations.length);

    // 2. Sessions (no filter)
    const upcomingSessions = await Session.find()
      .sort({ date: 1, startTime: 1 })
      .limit(5)
      .populate("expoId", "title");

    console.log("Sessions Found:", upcomingSessions.length);

    // 3. 🔥 SAARE EXPOS
    const allExpos = await Expo.find().sort({ createdAt: -1 }).limit(10);
    const upcomingExposList = allExpos.slice(0, 3);

    console.log("Total Expos Found in DB:", allExpos.length);
    console.log("Expos Sending to Frontend:", upcomingExposList.length);

    // 4. Notifications
    const notifications = await Notification.find({ user: req.user._id, read: false })
      .sort({ createdAt: -1 })
      .limit(5);

    console.log("Notifications Found:", notifications.length);

    // 5. Stats
    const registeredCount = registrations.length;

    res.json({
      success: true,
      stats: {
        registeredEvents: registeredCount,
        upcomingExpos: allExpos.length,
        unreadNotifications: notifications.length,
      },
      registrations,
      upcomingSessions,
      upcomingExposList,
      notifications,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    next(err);
  }
}

/* ============================================================
   GET /api/attendee/schedule
   ============================================================ */
async function getSchedule(req, res, next) {
  try {
    const sessions = await Session.find()
      .sort({ date: 1, startTime: 1 })
      .populate("expoId", "title");
    res.json({ success: true, sessions });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   POST /api/attendee/feedback
   ============================================================ */
async function submitFeedback(req, res, next) {
  try {
    const { expoId, rating, comment, type } = req.body;

    if (!expoId || !rating) {
      return res.status(400).json({ success: false, message: "Expo ID and rating are required." });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      expoId,
      rating,
      comment: comment || "",
      type: type || "event",
    });

    res.status(201).json({ success: true, message: "Feedback submitted.", feedback });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   POST /api/attendee/feedback-guest
   ============================================================ */
async function submitGuestFeedback(req, res, next) {
  try {
    const { name, email, category, rating, message } = req.body;

    if (!rating) {
      return res.status(400).json({ success: false, message: "Rating is required." });
    }

    const combinedComment = `From: ${name} (${email})\nCategory: ${category}\n\nMessage:\n${message || "No message"}`;

    const feedback = await Feedback.create({
      user: null,
      expoId: null,
      rating: Number(rating),
      comment: combinedComment,
      type: "general",
    });

    try {
      const admin = await User.findOne({ role: "admin" });
      if (admin) {
        await Notification.create({
          user: admin._id,
          type: "support",
          title: "New Guest Feedback Received",
          message: `${name} submitted a ${rating}-star review regarding "${category}".`,
          link: "/organizer/feedback",
          read: false,
        });
      }
    } catch (notifErr) {
      console.error("Failed to create admin notification:", notifErr);
    }

    res.status(201).json({ success: true, message: "Feedback submitted successfully.", feedback });
  } catch (err) {
    console.error("Guest Feedback Error:", err);
    next(err);
  }
}

/* ============================================================
   POST /api/attendee/contact
   ============================================================ */
async function sendContactEmail(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "madihaayub192@gmail.com",
      subject: `EventStrat Contact: ${subject || "New Message"}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>New Message from EventStrat.ai</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: 1px solid #ccc; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    try {
      const admin = await User.findOne({ role: "admin" });
      if (admin) {
        await Notification.create({
          user: admin._id,
          type: "support",
          title: "New Contact Message",
          message: `${name} sent a message: "${subject}"`,
          link: "/organizer/notifications",
          read: false,
        });
      }
    } catch (notifErr) {
      console.error("Failed to create admin notification:", notifErr);
    }

    res.status(200).json({ success: true, message: "Message sent successfully." });
  } catch (err) {
    console.error("Email send failed:", err);
    res.status(500).json({ success: false, message: "Failed to send email. Please try again later." });
  }
}

/* ============================================================
   GET /api/attendee/all
   ============================================================ */
async function getAllAttendees(req, res, next) {
  try {
    const registrations = await AttendeeRegistration.find()
      .populate("expoId", "title startDate endDate")
      .sort({ createdAt: -1 })
      .lean();

    const attendees = registrations.map((r) => ({
      id: r._id,
      name: `${r.firstName || ""} ${r.lastName || ""}`.trim() || "Unknown Attendee",
      email: r.email || "—",
      phone: r.phone || "—",
      company: r.organization || "—",
      jobTitle: r.jobTitle || "—",
      country: r.country || "—",
      city: r.city || "—",
      registrationId: r.bookingReference || `REG-${String(r._id).slice(-6).toUpperCase()}`,
      expoId: r.expoId?._id || r.expoId,
      expoName: r.expoId?.title || "—",
      ticketType: r.ticketType || "Standard",
      ticketId: r.ticketId,
      quantity: r.quantity || 1,
      totalAmount: r.totalAmount || 0,
      registeredDate: r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : "—",
      attendance: mapStatus(r.bookingStatus),
      paymentStatus: r.paymentStatus || "Not Applicable",
      checkedInAt: r.checkedInAt || null,
    }));

    res.json({ success: true, attendees });
  } catch (err) {
    next(err);
  }
}

/* Helper */
function mapStatus(status) {
  if (!status) return "Confirmed";
  switch (status) {
    case "Checked-In": return "Checked-In";
    case "Cancelled": return "Cancelled";
    case "Pending Payment Verification": return "Pending";
    case "Confirmed":
    default: return "Confirmed";
  }
}

/* ============================================================
   PATCH routes
   ============================================================ */
async function checkInAttendee(req, res, next) {
  try {
    const reg = await AttendeeRegistration.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: "Checked-In", checkedInAt: new Date() },
      { new: true }
    );
    if (!reg) return res.status(404).json({ success: false, message: "Registration not found." });
    res.json({ success: true, message: "Checked in successfully.", registration: reg });
  } catch (err) { next(err); }
}

async function undoCheckIn(req, res, next) {
  try {
    const reg = await AttendeeRegistration.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: "Confirmed", checkedInAt: null },
      { new: true }
    );
    if (!reg) return res.status(404).json({ success: false, message: "Registration not found." });
    res.json({ success: true, message: "Check-in undone.", registration: reg });
  } catch (err) { next(err); }
}

async function cancelRegistration(req, res, next) {
  try {
    const reg = await AttendeeRegistration.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: "Cancelled", checkedInAt: null },
      { new: true }
    );
    if (!reg) return res.status(404).json({ success: false, message: "Registration not found." });
    res.json({ success: true, message: "Registration cancelled.", registration: reg });
  } catch (err) { next(err); }
}

module.exports = {
  getDashboard,
  getSchedule,
  submitFeedback,
  submitGuestFeedback,
  sendContactEmail,
  getAllAttendees,
  checkInAttendee,
  undoCheckIn,
  cancelRegistration,
};