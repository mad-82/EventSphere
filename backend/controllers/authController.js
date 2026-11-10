const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const {
  generateToken,
  generateResetToken,
  verifyToken,
} = require("../utils/generateToken");
const { sendPasswordResetEmail } = require("../services/emailService");

const PUBLIC_ROLES = ["attendee", "exhibitor"];

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    companyName: user.companyName,
    industry: user.industry,
    website: user.website,
    companyDescription: user.companyDescription,
    registrationType: user.registrationType,
    isVerifiedExhibitor: user.isVerifiedExhibitor, // ✅ Yeh Add Kiya
    createdAt: user.createdAt,
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    const safeRole = PUBLIC_ROLES.includes(role) ? role : "attendee";

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const hashed = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      phone: phone || "",
      role: safeRole,
      isVerifiedExhibitor: safeRole === "exhibitor" ? false : true, // ✅ Exhibitor default unverified
    });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: "Account created successfully.", token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account is deactivated." });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    res.json({ success: true, message: "Login successful.", token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    res.json({ success: true, user: publicUser(req.user) });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    const genericResponse = { success: true, message: "If an account with that email exists, a reset link has been sent." };
    if (!user) return res.json(genericResponse);

    const token = generateResetToken(user._id);
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch (emailErr) {
      console.error("Email send error:", emailErr.message);
    }

    res.json(genericResponse);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and new password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Reset link is invalid or expired." });
    }

    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ success: false, message: "Invalid reset token." });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.password = await hashPassword(password);
    await user.save();

    res.json({ success: true, message: "Password reset successfully. Please log in." });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
    }

    const user = await User.findById(req.user._id).select("+password");
    const match = await comparePassword(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const allowed = ["name", "phone", "avatar", "companyName", "industry", "website", "companyDescription", "registrationType", "isVerifiedExhibitor"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

    res.json({ success: true, message: "Profile updated.", user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
};