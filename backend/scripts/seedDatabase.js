/**
 * SEED SCRIPT — Final version matching exact requirements
 *
 * Requirements:
 *  - 10 attendees (total users)
 *  - 12 expos (3 ongoing, 9 upcoming)
 *  - 15 booths per expo (total 180)
 *  - ~18 sessions total (1-2 per expo: morning + evening)
 *  - 10 exhibitors
 *  - Madiha Ayub: 4 confirmed booths + 2 pending requests = 6 booths
 *  - 4 other pending requests from other exhibitors
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Expo = require("../models/Expo");
const Booth = require("../models/Booth");
const Session = require("../models/Session");
const Application = require("../models/Application");
const AttendeeRegistration = require("../models/AttendeeRegistration");
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification");

if (process.env.NODE_ENV === "production") {
  console.error("❌ Seed script cannot run in production!");
  process.exit(1);
}

/* ============================================================
   EXPO DATA — 12 expos (3 ongoing, 9 upcoming)
   ============================================================ */
const EXPO_DATA = [
  // 3 ONGOING (dates surrounding today)
  { title: "TechWorld Expo 2026", theme: "Innovation & AI", category: "Technology", location: "Karachi", venue: "Karachi Expo Center", cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200", status: "Ongoing", dayOffset: -1 },
  { title: "GreenPack Summit", theme: "Sustainable Packaging", category: "Packaging", location: "Lahore", venue: "Lahore International Expo", cover: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=1200", status: "Ongoing", dayOffset: -2 },
  { title: "AutoTech Showcase", theme: "Future of Mobility", category: "Automotive", location: "Islamabad", venue: "Jinnah Convention Centre", cover: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200", status: "Ongoing", dayOffset: 0 },

  // 9 UPCOMING
  { title: "PharmaNext Forum", theme: "Healthcare Innovation", category: "Pharma", location: "Karachi", venue: "Karachi Expo Center", cover: "https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?w=1200", status: "Published", dayOffset: 15 },
  { title: "FoodFusion Expo", theme: "Culinary Trends", category: "F&B", location: "Lahore", venue: "Lahore International Expo", cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200", status: "Published", dayOffset: 22 },
  { title: "TextileVista Fair", theme: "Fashion & Fabrics", category: "Textiles", location: "Faisalabad", venue: "Faisalabad Expo Hall", cover: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200", status: "Published", dayOffset: 30 },
  { title: "ManufactureX Summit", theme: "Industry 4.0", category: "Manufacturing", location: "Multan", venue: "Multan Trade Center", cover: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1200", status: "Published", dayOffset: 38 },
  { title: "EduTech World", theme: "Learning Reinvented", category: "Education", location: "Islamabad", venue: "Jinnah Convention Centre", cover: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200", status: "Published", dayOffset: 45 },
  { title: "FinServ Conference", theme: "Digital Banking", category: "Finance", location: "Karachi", venue: "Karachi Expo Center", cover: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=1200", status: "Published", dayOffset: 52 },
  { title: "LogiChain Expo", theme: "Smart Logistics", category: "Logistics", location: "Lahore", venue: "Lahore International Expo", cover: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1200", status: "Published", dayOffset: 60 },
  { title: "HealthTech Showcase", theme: "Digital Wellness", category: "Pharma", location: "Islamabad", venue: "Jinnah Convention Centre", cover: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200", status: "Published", dayOffset: 70 },
  { title: "RetailFuture Summit", theme: "Commerce 2026", category: "Other", location: "Karachi", venue: "Karachi Expo Center", cover: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200", status: "Published", dayOffset: 80 },
];

/* ============================================================
   10 EXHIBITORS — Madiha + 9 others
   ============================================================ */
const EXHIBITORS = [
  // Madiha Ayub — SPECIAL (user's account)
  { name: "Madiha Ayub", email: "madihaayub192@gmail.com", companyName: "Madiha Innovations", industry: "Technology", website: "https://madihainnovations.com" },

  // 9 other exhibitors
  { name: "Hassan Iqbal", email: "hassan.iqbal@demo.com", companyName: "NovaTech Industries", industry: "Technology", website: "https://novatech.com" },
  { name: "Maria Sousa", email: "maria.sousa@demo.com", companyName: "Pinnacle Foods", industry: "F&B", website: "https://pinnaclefoods.com" },
  { name: "Daniel Wright", email: "daniel.wright@demo.com", companyName: "GreenLeaf Packaging", industry: "Packaging", website: "https://greenleaf.com" },
  { name: "Nadia Rahman", email: "nadia.rahman@demo.com", companyName: "BlueWave Systems", industry: "Technology", website: "https://bluewave.com" },
  { name: "Omar Farooq", email: "omar.farooq@demo.com", companyName: "Aurora Textiles", industry: "Textiles", website: "https://auroratextiles.com" },
  { name: "Priya Suresh", email: "priya.suresh@demo.com", companyName: "Swift Logistics", industry: "Logistics", website: "https://swiftlogistics.com" },
  { name: "Layla Ahmed", email: "layla.ahmed@demo.com", companyName: "Pharma Plus", industry: "Pharma", website: "https://pharmaplus.com" },
  { name: "Yusuf Ali", email: "yusuf.ali@demo.com", companyName: "AutoWorks", industry: "Automotive", website: "https://autoworks.com" },
  { name: "Sarah Khan", email: "sarah.khan@demo.com", companyName: "EduSphere", industry: "Education", website: "https://edusphere.com" },
];

/* ============================================================
   10 ATTENDEES
   ============================================================ */
const ATTENDEES = [
  { name: "Ayesha Malik", email: "ayesha.malik@demo.com" },
  { name: "Bilal Sheikh", email: "bilal.sheikh@demo.com" },
  { name: "Tariq Aziz", email: "tariq.aziz@demo.com" },
  { name: "Amina Noor", email: "amina.noor@demo.com" },
  { name: "Faisal Mahmood", email: "faisal.mahmood@demo.com" },
  { name: "Samira Javed", email: "samira.javed@demo.com" },
  { name: "Zainab Hussain", email: "zainab.hussain@demo.com" },
  { name: "Ali Raza", email: "ali.raza@demo.com" },
  { name: "Fatima Bibi", email: "fatima.bibi@demo.com" },
  { name: "Karim Shah", email: "karim.shah@demo.com" },
];

/* ============================================================
   HELPERS
   ============================================================ */
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pad(n) { return String(n).padStart(2, "0"); }
function makeRef(prefix) { return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randInt(1000, 9999)}`; }

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/* ============================================================
   CREATE 15 BOOTHS — 3 rows × 5 cols grid
   ============================================================ */
function create15Booths(expoId, expoIndex) {
  const booths = [];
  const rows = ["A", "B", "C"]; // 3 rows
  const cols = 5;               // 5 columns per row
  // Total = 3 × 5 = 15 booths

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    for (let col = 1; col <= cols; col++) {
      const rowLetter = rows[rowIdx];
      const boothNumber = `${rowLetter}-${pad(col)}`;

      // Type logic
      const isCorner = (rowIdx === 0 || rowIdx === 2) && (col === 1 || col === 5);
      const isPremium = rowIdx === 1 && (col === 2 || col === 3 || col === 4);
      let boothType = "Standard";
      if (isCorner) boothType = "Corner";
      if (isPremium) boothType = "Premium";

      booths.push({
        expoId,
        boothNumber,
        floor: "Ground Floor",
        hall: expoIndex % 2 === 0 ? "Main Hall" : "Hall A",
        size: isPremium ? "12×12 m²" : isCorner ? "9×9 m²" : "6×6 m²",
        totalArea: isPremium ? "144 sq. m" : isCorner ? "81 sq. m" : "36 sq. m",
        capacity: `${randInt(2, 6)} staff`,
        type: boothType,
        price: isPremium ? 150000 : isCorner ? 80000 : 45000,
        status: "Available",       // default, will be updated for booked booths
        facilities: ["Wi-Fi", "Power Outlet", "Table", "Chairs"],
        locationDetails: `Row ${rowLetter} · Column ${col}`,
        image: "",
        gridPosition: { row: rowIdx + 1, col },
        reservedBy: null,
      });
    }
  }
  return booths;
}

/* ============================================================
   SESSIONS — Total 18 across 12 expos
   Some expos get 2 sessions, some get 1
   ============================================================ */
const MORNING_SESSIONS = [
  { title: "Opening Keynote", type: "Keynote", speaker: "Dr. Ayesha Khan", startTime: "09:00", endTime: "10:30" },
  { title: "Industry Insights", type: "Panel", speaker: "Michael Chen", startTime: "10:00", endTime: "11:30" },
  { title: "Hands-on Workshop", type: "Workshop", speaker: "Sara Al-Rashid", startTime: "09:30", endTime: "11:00" },
];

const EVENING_SESSIONS = [
  { title: "Innovation Showcase", type: "Keynote", speaker: "Ahmed Raza", startTime: "16:00", endTime: "17:30" },
  { title: "Fireside Chat", type: "Panel", speaker: "Priya Nair", startTime: "17:00", endTime: "18:00" },
  { title: "Networking Reception", type: "Networking", speaker: "Organizer Team", startTime: "18:00", endTime: "19:30" },
];

function createSessions(expoId, startDate, expoIndex) {
  const sessions = [];
  const day1 = startDate;

  // First 6 expos get 2 sessions (morning + evening) = 12 sessions
  // Next 6 expos get 1 session (alternating morning/evening) = 6 sessions
  // Total = 18 sessions

  if (expoIndex < 6) {
    // 2 sessions
    const morning = MORNING_SESSIONS[expoIndex % MORNING_SESSIONS.length];
    const evening = EVENING_SESSIONS[expoIndex % EVENING_SESSIONS.length];

    sessions.push({
      expoId,
      title: morning.title,
      description: `Join us for ${morning.title.toLowerCase()} — industry insights and networking.`,
      speaker: morning.speaker,
      date: day1,
      startTime: morning.startTime,
      endTime: morning.endTime,
      room: "Hall A · Main Stage",
      type: morning.type,
    });

    sessions.push({
      expoId,
      title: evening.title,
      description: `Explore ${evening.title.toLowerCase()} with industry experts.`,
      speaker: evening.speaker,
      date: day1,
      startTime: evening.startTime,
      endTime: evening.endTime,
      room: "Hall B · Conference Room",
      type: evening.type,
    });
  } else {
    // 1 session (alternating morning/evening)
    const isMorning = expoIndex % 2 === 0;
    const session = isMorning
      ? MORNING_SESSIONS[expoIndex % MORNING_SESSIONS.length]
      : EVENING_SESSIONS[expoIndex % EVENING_SESSIONS.length];

    sessions.push({
      expoId,
      title: session.title,
      description: `Join us for ${session.title.toLowerCase()}.`,
      speaker: session.speaker,
      date: day1,
      startTime: session.startTime,
      endTime: session.endTime,
      room: isMorning ? "Hall A · Main Stage" : "Hall B · Conference Room",
      type: session.type,
    });
  }

  return sessions;
}

/* ============================================================
   MAIN SEED
   ============================================================ */
async function seedDatabase() {
  try {
    console.log("🌱 Starting seed...\n");

    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventsphere";
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Connected: ${mongoose.connection.name}\n`);

    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      User.deleteMany({ role: { $in: ["organizer", "exhibitor", "attendee"] } }),
      Expo.deleteMany({}),
      Booth.deleteMany({}),
      Session.deleteMany({}),
      Application.deleteMany({}),
      AttendeeRegistration.deleteMany({}),
      Feedback.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log("✅ Cleared\n");

    /* ORGANIZER */
    console.log("👤 Creating organizer...");
    const hashedPass = await bcrypt.hash("password123", 10);
    const organizer = await User.create({
      name: "Sarah Organizer",
      email: "organizer@eventsphere.com",
      password: hashedPass,
      phone: "+92 300 1234567",
      role: "organizer",
      isActive: true,
    });
    console.log(`✅ Organizer: ${organizer.email} / password123\n`);

    /* 10 EXHIBITORS */
    console.log("🏢 Creating 10 exhibitors...");
    const exhibitorUsers = [];
    for (const ex of EXHIBITORS) {
      const u = await User.create({
        name: ex.name,
        email: ex.email,
        password: hashedPass,
        phone: `+92 300 ${randInt(1000000, 9999999)}`,
        role: "exhibitor",
        companyName: ex.companyName,
        industry: ex.industry,
        website: ex.website,
        companyDescription: `${ex.companyName} is a leading player in ${ex.industry}.`,
        isVerifiedExhibitor: true,
        isActive: true,
      });
      exhibitorUsers.push(u);
    }
    const madihaUser = exhibitorUsers[0]; // First is Madiha
    console.log(`✅ Created 10 exhibitors`);
    console.log(`   ⭐ Madiha: ${madihaUser.email}\n`);

    /* 10 ATTENDEES */
    console.log("👥 Creating 10 attendees...");
    const attendeeUsers = [];
    for (const att of ATTENDEES) {
      const u = await User.create({
        name: att.name,
        email: att.email,
        password: hashedPass,
        phone: `+92 321 ${randInt(1000000, 9999999)}`,
        role: "attendee",
        isActive: true,
      });
      attendeeUsers.push(u);
    }
    console.log(`✅ Created 10 attendees\n`);

    /* EXPOS */
    console.log("🎪 Creating 12 expos with 15 booths + sessions each...\n");

    const today = new Date();
    const expoObjects = [];

    for (let i = 0; i < EXPO_DATA.length; i++) {
      const e = EXPO_DATA[i];
      const startDate = addDays(today, e.dayOffset);
      const endDate = addDays(startDate, 2); // 3-day expo

      const regStart = addDays(startDate, -30);
      const regEnd = addDays(startDate, -1);

      const expo = await Expo.create({
        organizer: organizer._id,
        title: e.title,
        description: `${e.title} brings together industry leaders and innovators. Theme: ${e.theme}. ${e.status === "Ongoing" ? "Happening now!" : "Join us for 3 days of networking and insights."}`,
        theme: e.theme,
        category: e.category,
        cover: e.cover,
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10),
        location: e.location,
        venue: e.venue,
        registrationStart: regStart.toISOString().slice(0, 10),
        registrationEnd: regEnd.toISOString().slice(0, 10),
        maxAttendees: randInt(500, 3000),
        status: e.status === "Ongoing" ? "Published" : e.status,
      });

      // 15 BOOTHS
      const booths = create15Booths(expo._id, i);
      const insertedBooths = await Booth.insertMany(booths);

      // SESSIONS (1-2)
      const sessions = createSessions(expo._id, startDate.toISOString().slice(0, 10), i);
      await Session.insertMany(sessions);

      expoObjects.push({ expo, booths: insertedBooths, sessions });

      console.log(`  ✅ [${i + 1}/12] ${expo.title} (${e.status})`);
      console.log(`      · 15 booths · ${sessions.length} session(s)`);
    }

    console.log("\n═══════════════════════════════════════════════════════");
    console.log("📋 Now assigning exhibitor applications & booths...\n");

    /* ============================================================
       EXHIBITOR BOOTH ASSIGNMENTS
       ============================================================ */

    /* ⭐ MADIHA'S BOOTHS — 4 CONFIRMED + 2 PENDING = 6 TOTAL */

    // Madiha's 4 CONFIRMED bookings — in expos [0, 3, 5, 8]
    const madihaConfirmedExpos = [0, 3, 5, 8];
    console.log("⭐ Madiha Ayub — 4 CONFIRMED booths:");
    for (const expoIdx of madihaConfirmedExpos) {
      const { expo, booths } = expoObjects[expoIdx];
      // Pick a premium booth (row 2, col 2-4)
      const premiumBooth = booths.find(
        (b) => b.gridPosition.row === 2 && b.gridPosition.col >= 2 && b.gridPosition.col <= 4
      );

      // Create approved application
      await Application.create({
        exhibitor: madihaUser._id,
        expoId: expo._id,
        status: "approved",
        boothType: premiumBooth.type,
        boothSize: premiumBooth.size,
        staffCount: randInt(2, 5),
        products: ["Product A", "Product B"],
        services: ["Consulting"],
        notes: "Excited to participate!",
      });

      // Update booth as booked by Madiha
      await Booth.findByIdAndUpdate(premiumBooth._id, {
        status: "Booked",
        reservedBy: madihaUser._id,
      });

      console.log(`   ✅ ${expo.title} → Booth ${premiumBooth.boothNumber}`);
    }

    // Madiha's 2 PENDING requests — in expos [6, 9]
    const madihaPendingExpos = [6, 9];
    console.log("\n⏳ Madiha Ayub — 2 PENDING requests (admin approval needed):");
    for (const expoIdx of madihaPendingExpos) {
      const { expo, booths } = expoObjects[expoIdx];
      // Pick a corner booth
      const cornerBooth = booths.find((b) => b.type === "Corner");

      // Create pending application
      await Application.create({
        exhibitor: madihaUser._id,
        expoId: expo._id,
        status: "pending",
        boothType: cornerBooth.type,
        boothSize: cornerBooth.size,
        staffCount: randInt(2, 4),
        products: ["Product A"],
        services: ["Consulting"],
        notes: "Please approve my booth request.",
      });

      // Update booth as reserved (pending approval)
      await Booth.findByIdAndUpdate(cornerBooth._id, {
        status: "Reserved",
        reservedBy: madihaUser._id,
      });

      console.log(`   ⏳ ${expo.title} → Booth ${cornerBooth.boothNumber} (reserved)`);
    }

    /* 4 OTHER PENDING REQUESTS from other exhibitors */
    console.log("\n⏳ 4 OTHER exhibitors — PENDING requests:");

    const otherPending = [
      { expoIdx: 1, exhibitorIdx: 1 },  // Hassan → GreenPack
      { expoIdx: 2, exhibitorIdx: 2 },  // Maria → AutoTech
      { expoIdx: 4, exhibitorIdx: 3 },  // Daniel → FoodFusion
      { expoIdx: 7, exhibitorIdx: 4 },  // Nadia → EduTech
    ];

    for (const { expoIdx, exhibitorIdx } of otherPending) {
      const { expo, booths } = expoObjects[expoIdx];
      const exhibitorUser = exhibitorUsers[exhibitorIdx];

      // Pick a standard booth (row 1 or 3, middle column)
      const stdBooth = booths.find(
        (b) => b.type === "Standard" && b.status === "Available"
      );

      await Application.create({
        exhibitor: exhibitorUser._id,
        expoId: expo._id,
        status: "pending",
        boothType: stdBooth.type,
        boothSize: stdBooth.size,
        staffCount: randInt(2, 4),
        products: ["Product X"],
        services: ["Support"],
        notes: "Looking forward to joining this expo.",
      });

      await Booth.findByIdAndUpdate(stdBooth._id, {
        status: "Reserved",
        reservedBy: exhibitorUser._id,
      });

      console.log(`   ⏳ ${exhibitorUser.companyName} → ${expo.title} (booth ${stdBooth.boothNumber})`);
    }

    /* FILL REMAINING BOOTHS — some Booked, some Reserved, some Available */
    console.log("\n🏷️  Filling remaining booths with varied statuses...");
    for (let expoIdx = 0; expoIdx < expoObjects.length; expoIdx++) {
      const { booths } = expoObjects[expoIdx];
      const availableBooths = booths.filter((b) => b.status === "Available");

      // Randomly assign statuses to remaining booths (30% booked, 20% reserved, 50% available)
      for (const booth of availableBooths) {
        const roll = Math.random();
        let newStatus = "Available";
        if (roll < 0.3) newStatus = "Booked";
        else if (roll < 0.5) newStatus = "Reserved";

        if (newStatus !== "Available") {
          // Assign random exhibitor (non-Madiha)
          const randomExhibitor = rand(exhibitorUsers.slice(1));
          await Booth.findByIdAndUpdate(booth._id, {
            status: newStatus,
            reservedBy: newStatus === "Booked" ? randomExhibitor._id : null,
          });
        }
      }
    }
    console.log("✅ Booth statuses updated\n");

    /* ATTENDEE REGISTRATIONS — spread across expos */
    console.log("🎫 Creating attendee registrations...");
    for (let i = 0; i < attendeeUsers.length; i++) {
      const u = attendeeUsers[i];
      // Each attendee registers for 1-3 expos
      const numExpos = randInt(1, 3);
      const shuffledExpos = [...expoObjects].sort(() => Math.random() - 0.5);

      for (let j = 0; j < numExpos; j++) {
        const { expo } = shuffledExpos[j];
        const [first, ...rest] = u.name.split(" ");
        const last = rest.join(" ") || "User";
        const isVIP = Math.random() > 0.7;
        const price = isVIP ? 5000 : 0;
        const bookingStatus = rand(["Confirmed", "Confirmed", "Checked-In", "Pending Payment Verification"]);

        await AttendeeRegistration.create({
          expoId: expo._id,
          userId: u._id,
          ticketType: isVIP ? "VIP" : "Standard",
          quantity: 1,
          ticketPrice: price,
          totalAmount: price,
          bookingReference: makeRef("REG"),
          ticketId: makeRef("TKT"),
          bookingStatus,
          checkedInAt: bookingStatus === "Checked-In" ? new Date() : null,
          paymentStatus: isVIP ? rand(["Paid", "Verified"]) : "Not Applicable",
          firstName: first,
          lastName: last,
          email: u.email,
          phone: u.phone || "+92 300 0000000",
          country: "Pakistan",
          city: expo.location,
          organization: "—",
          jobTitle: "Professional",
          hearAboutUs: "Website",
        });
      }
    }
    console.log(`✅ Created attendee registrations\n`);

    /* FEEDBACK — for ongoing expos only */
    console.log("💬 Creating feedback for ongoing expos...");
    for (let expoIdx = 0; expoIdx < 3; expoIdx++) {
      const { expo } = expoObjects[expoIdx];
      const numFeedback = randInt(3, 5);
      for (let f = 0; f < numFeedback; f++) {
        await Feedback.create({
          user: rand(attendeeUsers)._id,
          expoId: expo._id,
          rating: randInt(4, 5),
          comment: rand([
            "Great event, very well organized!",
            "Loved the sessions and networking.",
            "Excellent speakers and content.",
            "Will definitely attend again.",
          ]),
          type: "event",
        });
      }
    }
    console.log(`✅ Created feedback\n`);

    /* NOTIFICATIONS — with VALID enum types */
    console.log("🔔 Creating notifications...");
    const notifData = [];

    // Madiha gets notifications (booth + application)
    notifData.push({
      user: madihaUser._id,
      type: "booth",
      title: "Booth Assigned",
      message: "Your booth has been confirmed for TechWorld Expo 2026.",
      link: "/exhibitor/booths",
      read: false,
    });

    notifData.push({
      user: madihaUser._id,
      type: "application",
      title: "Application Under Review",
      message: "Your application for ManufactureX Summit is under review.",
      link: "/exhibitor/applications",
      read: false,
    });

    // A few attendees get announcements
    for (let i = 0; i < 3; i++) {
      notifData.push({
        user: attendeeUsers[i]._id,
        type: "announcement",
        title: "Welcome to EventSphere",
        message: "Browse upcoming expos and register today!",
        link: "/expos",
        read: false,
      });
    }

    await Notification.insertMany(notifData);
    console.log(`✅ Created ${notifData.length} notifications\n`);

    /* SUMMARY */
    console.log("═══════════════════════════════════════════════════════");
    console.log("🎉 SEED COMPLETE!");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`📊 Organizers:         ${await User.countDocuments({ role: "organizer" })}`);
    console.log(`📊 Exhibitors:         ${await User.countDocuments({ role: "exhibitor" })}`);
    console.log(`📊 Attendees:          ${await User.countDocuments({ role: "attendee" })}`);
    console.log(`📊 Expos:              ${await Expo.countDocuments()}`);
    console.log(`📊 Booths:             ${await Booth.countDocuments()}`);
    console.log(`📊 Sessions:           ${await Session.countDocuments()}`);
    console.log(`📊 Applications:       ${await Application.countDocuments()}`);
    console.log(`📊 Registrations:      ${await AttendeeRegistration.countDocuments()}`);
    console.log(`📊 Feedback:           ${await Feedback.countDocuments()}`);
    console.log(`📊 Notifications:      ${await Notification.countDocuments()}`);
    console.log("═══════════════════════════════════════════════════════");
    console.log("\n⭐ Madiha Ayub (madihaayub192@gmail.com):");
    console.log("   • 4 CONFIRMED booth bookings");
    console.log("   • 2 PENDING requests (awaiting admin approval)");
    console.log("   • Total 6 booth applications");
    console.log("\n⏳ 4 other PENDING requests awaiting admin approval");
    console.log("\n🔐 Login credentials:");
    console.log("   Organizer:  organizer@eventsphere.com / password123");
    console.log("   Exhibitor:  madihaayub192@gmail.com / password123");
    console.log("   Attendee:   ayesha.malik@demo.com / password123");
    console.log("\n✨ Refresh your frontend!\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ SEED FAILED:", err.message);
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();