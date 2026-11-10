require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const { hashPassword } = require("../utils/passwordUtils");

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@eventsphere.pk")
      .toLowerCase()
      .trim();

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log(`ℹ️  Admin already exists: ${adminEmail}`);
      console.log(`   Role: ${existing.role}`);
      await mongoose.disconnect();
      return;
    }

    const hashed = await hashPassword(
      process.env.ADMIN_PASSWORD || "Admin@12345"
    );

    const admin = await User.create({
      name: process.env.ADMIN_NAME || "EventSphere Admin",
      email: adminEmail,
      password: hashed,
      role: "admin",
      isActive: true,
    });

    console.log("🎉 Admin user created:");
    console.log(`   Name:  ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role:  ${admin.role}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || "Admin@12345"}`);
    console.log("\n⚠️  Change the password after first login!");

    await mongoose.disconnect();
    console.log("✅ Done");
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seedAdmin();