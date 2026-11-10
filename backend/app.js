const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const corsOptions = require("./config/cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// 1. Saare Routes Import Karein
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const boothRoutes = require("./routes/boothRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const registrationRoutes = require("./routes/registrationRoutes");

// ✅ Exhibitor panel routes
const exhibitorRoutes = require("./routes/exhibitorRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const staffRoutes = require("./routes/staffRoutes");
const productRoutes = require("./routes/productRoutes");
const messageRoutes = require("./routes/messageRoutes");

// ✅ Attendee panel routes
const attendeeRoutes = require("./routes/attendeeRoutes");

// ✅ Feedback routes
const feedbackRoutes = require("./routes/feedbackRoutes");

// ✅ Analytics routes (Naya import)
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads folder ko publicly accessible banayein
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "EventSphere API is running" });
});

// 2. Routes ko yahan Mount Karein
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/booths", boothRoutes);
app.use("/api/sessions", scheduleRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/registrations", registrationRoutes);

// ✅ Exhibitor panel routes
app.use("/api/exhibitors", exhibitorRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/products", productRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Attendee panel routes
app.use("/api/attendee", attendeeRoutes);

// ✅ Feedback routes
app.use("/api/feedback", feedbackRoutes);

// ✅ Analytics routes (Naya mount)
app.use("/api/analytics", analyticsRoutes);

// 404 & Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;