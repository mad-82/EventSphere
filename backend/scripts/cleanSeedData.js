/**
 * CLEAN SEED DATA — Sirf seed script se aaya data delete karta hai
 * Aapka manually created data 100% safe rahega
 *
 * Usage:
 *   cd backend
 *   node scripts/cleanSeedData.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/User");
const Expo = require("../models/Expo");
const Booth = require("../models/Booth");
const Session = require("../models/Session");
const Application = require("../models/Application");
const AttendeeRegistration = require("../models/AttendeeRegistration");
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification");

if (process.env.NODE_ENV === "production") {
  console.error("❌ Clean script cannot run in production!");
  process.exit(1);
}

/* ============================================================
   SEED DATA IDENTIFIERS — Yahan define karein
   ============================================================ */

// Seed user emails
const SEED_EMAILS = [
  "organizer@eventsphere.com",
  ...Array.from({ length: 15 }, (_, i) => `exhibitor${i + 1}@demo.com`),
  ...Array.from({ length: 40 }, (_, i) => `attendee${i + 1}@demo.com`),
];

// Seed expo titles
const SEED_EXPO_TITLES = [
  "TechWorld Expo 2026",
  "GreenPack Summit",
  "AutoTech Showcase",
  "PharmaNext Forum",
  "FoodFusion Expo",
  "TextileVista Fair",
  "ManufactureX Summit",
  "EduTech World",
  "FinServ Conference",
  "LogiChain Expo",
  "HealthTech Showcase",
  "RetailFuture Summit",
];

// Seed application notes
const SEED_APP_NOTES = "Looking forward to showcasing our latest innovations.";

// Seed notification titles
const SEED_NOTIF_TITLES = [
  "Welcome to EventSphere",
  "Account Verified",
  "New Support Reply",
  "Booth Assigned",
  "Application Approved",
];

// Seed feedback comments
const SEED_FEEDBACK_COMMENTS = [
  "Great event, very well organized!",
  "Loved the sessions and networking.",
  "Could be better with more workshops.",
  "Excellent speakers and content.",
  "Will definitely attend next year.",
];

// Seed session speakers
const SEED_SPEAKERS = [
  "Dr. Ayesha Khan",
  "Michael Chen",
  "Sara Al-Rashid",
  "Ahmed Raza",
  "Priya Nair",
  "John Smith",
  "Fatima Zahra",
  "Organizer Team",
];

// Seed session titles
const SEED_SESSION_TITLES = [
  "Opening Keynote",
  "Future of Industry",
  "AI & Automation",
  "Panel Discussion",
  "Networking Break",
  "Hands-on Workshop",
  "Closing Remarks",
  "Fireside Chat",
  "Innovation Showcase",
  "Startup Pitch",
  "Awards Ceremony",
  "Round Table",
];

/* ============================================================
   CLEAN FUNCTION
   ============================================================ */
async function cleanSeedData() {
  try {
    console.log("🧹 Starting SEED DATA cleanup...\n");

    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventsphere";
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Connected: ${mongoose.connection.name}\n`);

    /* --- STEP 1: Identify seed users --- */
    console.log("🔍 Identifying seed users...");
    const seedUsers = await User.find({ email: { $in: SEED_EMAILS } }).select("_id email role");
    const seedUserIds = seedUsers.map((u) => u._id);
    console.log(`   Found ${seedUsers.length} seed users`);
    console.log(`   (Organizers: ${seedUsers.filter(u => u.role === "organizer").length}, Exhibitors: ${seedUsers.filter(u => u.role === "exhibitor").length}, Attendees: ${seedUsers.filter(u => u.role === "attendee").length})\n`);

    /* --- STEP 2: Identify seed expos --- */
    console.log("🔍 Identifying seed expos...");
    const seedExpos = await Expo.find({ title: { $in: SEED_EXPO_TITLES } }).select("_id title");
    const seedExpoIds = seedExpos.map((e) => e._id);
    console.log(`   Found ${seedExpos.length} seed expos\n`);

    if (seedUserIds.length === 0 && seedExpoIds.length === 0) {
      console.log("✅ No seed data found — database is already clean!\n");
      await mongoose.disconnect();
      process.exit(0);
    }

    /* --- STEP 3: Delete related data --- */
    console.log("🗑️  Deleting seed-related data...\n");

    // 3a. Booths belonging to seed expos
    const boothsResult = await Booth.deleteMany({ expoId: { $in: seedExpoIds } });
    console.log(`   ✅ Booths:          ${boothsResult.deletedCount} deleted`);

    // 3b. Sessions belonging to seed expos
    const sessionsResult = await Session.deleteMany({ expoId: { $in: seedExpoIds } });
    console.log(`   ✅ Sessions:        ${sessionsResult.deletedCount} deleted`);

    // 3c. Applications for seed expos OR by seed exhibitors
    const appsResult = await Application.deleteMany({
      $or: [
        { expoId: { $in: seedExpoIds } },
        { exhibitor: { $in: seedUserIds } },
      ],
    });
    console.log(`   ✅ Applications:    ${appsResult.deletedCount} deleted`);

    // 3d. Attendee registrations for seed expos OR by seed attendees
    const regsResult = await AttendeeRegistration.deleteMany({
      $or: [
        { expoId: { $in: seedExpoIds } },
        { userId: { $in: seedUserIds } },
      ],
    });
    console.log(`   ✅ Registrations:   ${regsResult.deletedCount} deleted`);

    // 3e. Feedback for seed expos OR by seed users
    const feedbackResult = await Feedback.deleteMany({
      $or: [
        { expoId: { $in: seedExpoIds } },
        { user: { $in: seedUserIds } },
      ],
    });
    console.log(`   ✅ Feedback:        ${feedbackResult.deletedCount} deleted`);

    // 3f. Notifications for seed users
    const notifResult = await Notification.deleteMany({
      user: { $in: seedUserIds },
    });
    console.log(`   ✅ Notifications:   ${notifResult.deletedCount} deleted`);

    // 3g. Seed expos
    const exposResult = await Expo.deleteMany({ _id: { $in: seedExpoIds } });
    console.log(`   ✅ Expos:           ${exposResult.deletedCount} deleted`);

    // 3h. Seed users (LAST — after all references gone)
    const usersResult = await User.deleteMany({ _id: { $in: seedUserIds } });
    console.log(`   ✅ Users:           ${usersResult.deletedCount} deleted\n`);

    /* --- STEP 4: Final summary --- */
    console.log("═══════════════════════════════════════════════════════");
    console.log("🧹 SEED DATA CLEANUP COMPLETE!");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`   Remaining Users:           ${await User.countDocuments()}`);
    console.log(`   Remaining Expos:           ${await Expo.countDocuments()}`);
    console.log(`   Remaining Booths:          ${await Booth.countDocuments()}`);
    console.log(`   Remaining Sessions:        ${await Session.countDocuments()}`);
    console.log(`   Remaining Applications:    ${await Application.countDocuments()}`);
    console.log(`   Remaining Registrations:   ${await AttendeeRegistration.countDocuments()}`);
    console.log(`   Remaining Feedback:        ${await Feedback.countDocuments()}`);
    console.log(`   Remaining Notifications:   ${await Notification.countDocuments()}`);
    console.log("═══════════════════════════════════════════════════════");
    console.log("\n✅ Aapka original data 100% SAFE hai!");
    console.log("✅ Sirf seed script se aaya data delete hua.\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ CLEANUP FAILED:", err.message);
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

cleanSeedData();