const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // never return password by default
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "organizer", "exhibitor", "attendee"],
      default: "attendee",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    // Exhibitor-specific
    companyName: { type: String, default: "" },
    industry: { type: String, default: "" },
    website: { type: String, default: "" },
    companyDescription: { type: String, default: "" },
    // ✅ EXHIBITOR VERIFICATION FLAG
    isVerifiedExhibitor: {
      type: Boolean,
      default: false,
    },
    // Attendee-specific
    registrationType: {
      type: String,
      enum: ["Professional", "Student", "Press", "Exhibitor Guest"],
      default: "Professional",
    },
  },
  { timestamps: true }
);

// Prevent duplicate email with case-insensitivity handled by lowercase
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);