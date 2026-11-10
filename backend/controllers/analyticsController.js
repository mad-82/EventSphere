const Expo = require("../models/Expo");
const AttendeeRegistration = require("../models/AttendeeRegistration");
const Application = require("../models/Application");
const Booth = require("../models/Booth");
const Session = require("../models/Session");
const Feedback = require("../models/Feedback");

/* ============================================================
   GET /api/analytics/overview
   ============================================================ */
async function getOverview(req, res, next) {
  try {
    const [
      totalExpos,
      totalAttendees,
      totalExhibitors,
      totalApplications,
      totalBooths,
      totalSessions,
    ] = await Promise.all([
      Expo.countDocuments(),
      AttendeeRegistration.countDocuments(),
      Application.countDocuments({ status: "approved" }),
      Application.countDocuments(),
      Booth.countDocuments(),
      Session.countDocuments(),
    ]);

    const regs = await AttendeeRegistration.find({ bookingStatus: "Confirmed" });
    const totalRevenue = regs.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

    res.json({
      success: true,
      stats: {
        totalExpos,
        totalAttendees,
        totalExhibitors,
        totalApplications,
        totalBooths,
        totalSessions,
        totalRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/analytics/registrations-trend
   ============================================================ */
async function getRegistrationTrend(req, res, next) {
  try {
    const now = new Date();
    const months = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
        label: d.toLocaleString("en-US", { month: "short" }),
      });
    }

    const trend = await Promise.all(
      months.map(async (m) => {
        const [registrations, exhibitors] = await Promise.all([
          AttendeeRegistration.countDocuments({
            createdAt: { $gte: m.start, $lte: m.end },
          }),
          Application.countDocuments({
            status: "approved",
            createdAt: { $gte: m.start, $lte: m.end },
          }),
        ]);
        return { month: m.label, registrations, exhibitors };
      })
    );

    res.json({ success: true, trend });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/analytics/application-analytics
   ============================================================ */
async function getApplicationAnalytics(req, res, next) {
  try {
    const applications = await Application.find();

    const submitted = applications.length;
    const approved = applications.filter((a) => a.status === "approved").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    const pending = applications.filter((a) => a.status === "pending").length;

    res.json({
      success: true,
      analytics: { submitted, approved, rejected, pending },
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/analytics/booth-occupancy
   ============================================================ */
async function getBoothOccupancy(req, res, next) {
  try {
    const expos = await Expo.find().select("title");
    const data = await Promise.all(
      expos.map(async (expo) => {
        const [total, occupied, reserved, available] = await Promise.all([
          Booth.countDocuments({ expoId: expo._id }),
          Booth.countDocuments({
            expoId: expo._id,
            status: { $in: ["Occupied", "Booked"] },
          }),
          Booth.countDocuments({ expoId: expo._id, status: "Reserved" }),
          Booth.countDocuments({ expoId: expo._id, status: "Available" }),
        ]);
        return { expo: expo.title, total, occupied, reserved, available };
      })
    );

    res.json({ success: true, occupancy: data });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/analytics/session-popularity
   ============================================================ */
async function getSessionPopularity(req, res, next) {
  try {
    const sessions = await Session.find().select("title capacity registered");
    const data = sessions.map((s) => ({
      title: s.title,
      registered: s.registered || 0,
      capacity: s.capacity || 0,
    }));
    res.json({ success: true, popularity: data });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/analytics/event-comparison
   ============================================================ */
async function getEventComparison(req, res, next) {
  try {
    const expos = await Expo.find();
    const comparison = await Promise.all(
      expos.map(async (expo) => {
        const [exhibitors, attendees, sessions] = await Promise.all([
          Application.countDocuments({ expoId: expo._id, status: "approved" }),
          AttendeeRegistration.countDocuments({ expoId: expo._id }),
          Session.countDocuments({ expoId: expo._id }),
        ]);

        const feedback = await Feedback.find({ expoId: expo._id });
        const avgRating =
          feedback.length > 0
            ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
            : 0;

        return {
          id: expo._id,
          name: expo.title,
          exhibitors,
          attendees,
          sessions,
          satisfaction: parseFloat(avgRating.toFixed(1)),
        };
      })
    );

    res.json({ success: true, comparison });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/analytics/all
   ============================================================ */
async function getAllAnalytics(req, res, next) {
  try {
    const [statsRes, trendRes, appRes, boothRes, sessionRes, comparisonRes] =
      await Promise.all([
        getOverviewData(),
        getTrendData(),
        getAppData(),
        getBoothData(),
        getSessionData(),
        getComparisonData(),
      ]);

    res.json({
      success: true,
      stats: statsRes,
      registrationTrend: trendRes,
      applicationAnalytics: appRes,
      boothOccupancy: boothRes,
      sessionPopularity: sessionRes,
      eventComparison: comparisonRes,
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/analytics/dashboard
   Organizer Dashboard — consolidated data in ONE call
   ============================================================ */
async function getDashboardData(req, res, next) {
  try {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // Aaj ki date

    /* ---------- 1. KPI CARDS ---------- */
    const [
      totalExpos,
      totalAttendees,
      totalExhibitors,
      pendingApplications,
      approvedApplications,
    ] = await Promise.all([
      Expo.countDocuments(),
      AttendeeRegistration.countDocuments(),
      Application.countDocuments({ status: "approved" }),
      Application.countDocuments({ status: "pending" }),
      Application.countDocuments({ status: "approved" }),
    ]);

    const next30 = new Date();
    next30.setDate(now.getDate() + 30);
    const next30Str = next30.toISOString().slice(0, 10);

    const upcomingSessions = await Session.countDocuments({
      date: { $gte: todayStr, $lte: next30Str },
    }).catch(() => Session.countDocuments());

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [thisMonthRegs, lastMonthRegs] = await Promise.all([
      AttendeeRegistration.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      AttendeeRegistration.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);

    const attendeeChangePct =
      lastMonthRegs === 0
        ? thisMonthRegs > 0 ? 100 : 0
        : Math.round(((thisMonthRegs - lastMonthRegs) / lastMonthRegs) * 1000) / 10;

    const kpis = [
      { id: "events", label: "Total Events", value: totalExpos, change: 0, trend: "up", hint: "vs last quarter" },
      { id: "exhibitors", label: "Total Exhibitors", value: totalExhibitors, change: 0, trend: "up", hint: "vs last quarter" },
      { id: "attendees", label: "Total Attendees", value: totalAttendees, change: attendeeChangePct, trend: attendeeChangePct >= 0 ? "up" : "down", hint: "vs last month" },
      { id: "pending", label: "Pending Applications", value: pendingApplications, change: 0, trend: "down", hint: "awaiting review" },
      { id: "approved", label: "Approved Applications", value: approvedApplications, change: 0, trend: "up", hint: "all time" },
      { id: "sessions", label: "Upcoming Sessions", value: upcomingSessions, change: 0, trend: "up", hint: "next 30 days" },
    ];

    /* ---------- 2. REGISTRATION TREND (7 months) ---------- */
    const months = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
        label: d.toLocaleString("en-US", { month: "short" }),
      });
    }

    const registrationTrend = await Promise.all(
      months.map(async (m) => {
        const [registrations, exhibitors] = await Promise.all([
          AttendeeRegistration.countDocuments({ createdAt: { $gte: m.start, $lte: m.end } }),
          Application.countDocuments({ status: "approved", createdAt: { $gte: m.start, $lte: m.end } }),
        ]);
        return { month: m.label, registrations, exhibitors };
      })
    );

    /* ---------- 3. APPLICATION STATUS (Pie) ---------- */
    const allApps = await Application.find().select("status");
    const appStatus = [
      { name: "Approved", value: allApps.filter((a) => a.status === "approved").length, color: "#34D399" },
      { name: "Pending", value: allApps.filter((a) => a.status === "pending").length, color: "#FBBF24" },
      { name: "Rejected", value: allApps.filter((a) => a.status === "rejected").length, color: "#F87171" },
    ];

    /* ---------- 4. WEEKLY APPLICATIONS (Bar) ---------- */
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(now.getDate() - 42);

    const recentApps = await Application.find({ createdAt: { $gte: sixWeeksAgo } }).select("status createdAt");

    const applicationOverview = [];
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(now.getDate() - i * 7 - 6);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date();
      weekEnd.setDate(now.getDate() - i * 7);
      weekEnd.setHours(23, 59, 59, 999);

      const inWeek = recentApps.filter((a) => {
        const d = new Date(a.createdAt);
        return d >= weekStart && d <= weekEnd;
      });

      applicationOverview.push({
        week: `W${6 - i}`,
        applications: inWeek.length,
        approved: inWeek.filter((a) => a.status === "approved").length,
        rejected: inWeek.filter((a) => a.status === "rejected").length,
      });
    }

    /* ---------- 5. ATTENDEE CATEGORIES (FIXED) ---------- */
    // ✅ Yahan attendeeType ki jagah ticketType use kiya hai
    const attendeeTypes = await AttendeeRegistration.aggregate([
      { $group: { _id: "$ticketType", value: { $sum: 1 } } },
    ]);

    const colorMap = {
      "VIP": "#97BFD9",
      "Standard": "#6FA8CB",
      "Professional": "#97BFD9",
      "Student": "#6FA8CB",
      "Press": "#B5D7EA",
      "Exhibitor Guest": "#4A7C9B",
    };

    const attendeeCategory = attendeeTypes.map((t) => ({
      name: t._id || "Other",
      value: t.value,
      color: colorMap[t._id] || "#6B7280",
    }));

    /* ---------- 6. UPCOMING SESSIONS (4) (FIXED) ---------- */
    let upcomingSessionsList = [];
    try {
      const sessions = await Session.find({ date: { $gte: todayStr } })
        .sort({ date: 1, startTime: 1 })
        .limit(4)
        .lean();

      upcomingSessionsList = sessions.map((s) => ({
        id: s._id,
        title: s.title,
        speaker: s.speaker || "TBA",
        when: `${s.date} at ${s.startTime}`,
        room: s.room || "TBA",
      }));
    } catch {
      // Ignore
    }

    /* ---------- 7. RECENT APPLICATIONS (5) ---------- */
    const recentAppsList = await Application.find()
      .populate("exhibitor", "name email companyName company")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentApplications = recentAppsList.map((a) => ({
      id: a._id,
      company: a.exhibitor?.companyName || a.exhibitor?.company || a.exhibitor?.name || "Unknown Exhibitor",
      contact: a.exhibitor?.name || a.exhibitor?.email || "—",
      industry: a.boothType || a.boothSize || "—",
      size: a.boothSize || "—",
      submitted: new Date(a.createdAt).toISOString().slice(0, 10),
      status: a.status.charAt(0).toUpperCase() + a.status.slice(1),
    }));

    /* ---------- 8. RECENT ACTIVITIES ---------- */
    const [latestApps, latestRegs, latestSessions] = await Promise.all([
      Application.find().sort({ updatedAt: -1 }).limit(5).populate("exhibitor", "name companyName company").lean(),
      AttendeeRegistration.find().sort({ createdAt: -1 }).limit(3).lean(),
      Session.find().sort({ updatedAt: -1 }).limit(2).lean(),
    ]);

    const acts = [];

    latestApps.forEach((a) => {
      const company = a.exhibitor?.companyName || a.exhibitor?.company || a.exhibitor?.name || "Unknown";
      acts.push({
        id: `app-${a._id}`,
        text: `Application from '${company}' ${a.status}`,
        time: a.updatedAt || a.createdAt,
        type: a.status === "approved" ? "success" : a.status === "rejected" ? "danger" : "warning",
      });
    });

    latestRegs.forEach((r) => {
      const attendeeName = r.firstName ? `${r.firstName} ${r.lastName || ""}`.trim() : "Attendee";
      acts.push({
        id: `reg-${r._id}`,
        text: `New registration: '${attendeeName}'`,
        time: r.createdAt,
        type: "info",
      });
    });

    latestSessions.forEach((s) => {
      acts.push({
        id: `ses-${s._id}`,
        text: `Session '${s.title}' updated`,
        time: s.updatedAt || s.createdAt,
        type: "warning",
      });
    });

    acts.sort((a, b) => new Date(b.time) - new Date(a.time));

    const relTime = (date) => {
      const diff = Date.now() - new Date(date).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return "just now";
      if (m < 60) return `${m} min ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h} hr ago`;
      return `${Math.floor(h / 24)} day${h >= 48 ? "s" : ""} ago`;
    };

    const recentActivities = acts.slice(0, 6).map((a) => ({ ...a, time: relTime(a.time) }));

    /* ---------- 9. UPCOMING EVENTS (4) (FIXED) ---------- */
    // ✅ Filter lagaya hai taake sirf future events aayen
    const events = await Expo.find({ endDate: { $gte: todayStr } })
      .sort({ startDate: 1 })
      .limit(4)
      .lean();

    const upcomingEvents = events.map((e) => ({
      id: e._id,
      name: e.title,
      date: e.startDate
        ? `${new Date(e.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}${e.endDate ? ` – ${new Date(e.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}` : ""}`
        : "TBA",
      location: e.location || e.venue || "TBA",
      status: e.status ? e.status.charAt(0).toUpperCase() + e.status.slice(1) : "Draft",
    }));

    /* ---------- 10. RECENT REGISTRATIONS (4) ---------- */
    const recRegs = await AttendeeRegistration.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("expoId", "title")
      .lean();

    const recentRegistrations = recRegs.map((r) => ({
      id: r._id,
      name: r.firstName ? `${r.firstName} ${r.lastName || ""}`.trim() : "Attendee",
      type: r.ticketType || "Standard",
      event: r.expoId?.title || "—",
      time: relTime(r.createdAt),
    }));

    /* ---------- 11. BOOTH STATS ---------- */
    const booths = await Booth.find().select("status");
    const boothStats = {
      total: booths.length,
      occupied: booths.filter((b) => b.status === "Occupied" || b.status === "Booked").length,
      reserved: booths.filter((b) => b.status === "Reserved").length,
      available: booths.filter((b) => b.status === "Available").length,
    };

    /* ---------- 12. PENDING TASKS ---------- */
    const pendingTasks = [];
    if (pendingApplications > 0) {
      pendingTasks.push({
        id: "t1",
        text: `Review ${pendingApplications} pending exhibitor applications`,
        cta: "/organizer/applications",
        action: "Review",
      });
    }
    if (boothStats.reserved > 0) {
      pendingTasks.push({
        id: "t2",
        text: `Allocate ${boothStats.reserved} reserved booths`,
        cta: "/organizer/booths",
        action: "Allocate",
      });
    }

    /* ---------- FINAL RESPONSE ---------- */
    res.json({
      success: true,
      dashboard: {
        kpis,
        registrationTrend,
        applicationStatus: appStatus,
        applicationOverview,
        attendeeCategory,
        upcomingSessions: upcomingSessionsList,
        recentApplications,
        recentActivities,
        upcomingEvents,
        recentRegistrations,
        boothStats,
        pendingTasks,
      },
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   INTERNAL HELPERS (used by getAllAnalytics)
   ============================================================ */
async function getOverviewData() {
  const [totalExpos, totalAttendees, totalExhibitors] = await Promise.all([
    Expo.countDocuments(),
    AttendeeRegistration.countDocuments(),
    Application.countDocuments({ status: "approved" }),
  ]);
  const regs = await AttendeeRegistration.find({ bookingStatus: "Confirmed" });
  const totalRevenue = regs.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  return { totalExpos, totalAttendees, totalExhibitors, totalRevenue };
}

async function getTrendData() {
  const now = new Date();
  const months = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
      label: d.toLocaleString("en-US", { month: "short" }),
    });
  }
  return Promise.all(
    months.map(async (m) => {
      const [registrations, exhibitors] = await Promise.all([
        AttendeeRegistration.countDocuments({ createdAt: { $gte: m.start, $lte: m.end } }),
        Application.countDocuments({ status: "approved", createdAt: { $gte: m.start, $lte: m.end } }),
      ]);
      return { month: m.label, registrations, exhibitors };
    })
  );
}

async function getAppData() {
  const apps = await Application.find();
  return {
    submitted: apps.length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };
}

async function getBoothData() {
  const expos = await Expo.find().select("title");
  return Promise.all(
    expos.map(async (expo) => {
      const [total, occupied, reserved, available] = await Promise.all([
        Booth.countDocuments({ expoId: expo._id }),
        Booth.countDocuments({ expoId: expo._id, status: { $in: ["Occupied", "Booked"] } }),
        Booth.countDocuments({ expoId: expo._id, status: "Reserved" }),
        Booth.countDocuments({ expoId: expo._id, status: "Available" }),
      ]);
      return { expo: expo.title, total, occupied, reserved, available };
    })
  );
}

async function getSessionData() {
  const sessions = await Session.find().select("title capacity registered");
  return sessions.map((s) => ({
    title: s.title,
    registered: s.registered || 0,
    capacity: s.capacity || 0,
  }));
}

async function getComparisonData() {
  const expos = await Expo.find();
  return Promise.all(
    expos.map(async (expo) => {
      const [exhibitors, attendees, sessions] = await Promise.all([
        Application.countDocuments({ expoId: expo._id, status: "approved" }),
        AttendeeRegistration.countDocuments({ expoId: expo._id }),
        Session.countDocuments({ expoId: expo._id }),
      ]);
      const feedback = await Feedback.find({ expoId: expo._id });
      const avgRating =
        feedback.length > 0
          ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
          : 0;
      return {
        id: expo._id,
        name: expo.title,
        exhibitors,
        attendees,
        sessions,
        satisfaction: parseFloat(avgRating.toFixed(1)),
      };
    })
  );
}

/* ============================================================
   EXPORTS
   ============================================================ */
module.exports = {
  getOverview,
  getRegistrationTrend,
  getApplicationAnalytics,
  getBoothOccupancy,
  getSessionPopularity,
  getEventComparison,
  getAllAnalytics,
  getDashboardData,
};