const mongoose = require("mongoose");

const expoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    theme: { type: String, default: "" },
    category: { type: String, required: true },
    cover: { type: String, default: "" },
    registrationStart: { type: String, required: true },
    registrationEnd: { type: String, required: true },
    maxAttendees: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    exhibitorCount: { type: Number, default: 0 },
    attendeeCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

expoSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Expo", expoSchema);