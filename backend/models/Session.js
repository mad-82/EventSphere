const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    expoId: { type: mongoose.Schema.Types.ObjectId, ref: "Expo", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    speaker: { type: String, required: true, trim: true },
    date: { type: String, required: true }, // e.g., "2026-11-15"
    startTime: { type: String, required: true }, // e.g., "10:00"
    endTime: { type: String, required: true }, // e.g., "11:30"
    room: { type: String, required: true, trim: true }, // e.g., "Hall A"
    type: { type: String, default: "Keynote" }, 
  },
  { timestamps: true }
);

sessionSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Session", sessionSchema);