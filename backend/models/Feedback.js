const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // ✅ Guest users ke liye optional kiya
    },
    expoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expo",
      required: false, // ✅ Guest feedback kisi specific expo ka nahi hota
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["event", "platform", "general", "system"], // ✅ "general" aur "platform" add kiya
      default: "event",
    },
  },
  { timestamps: true }
);

feedbackSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Feedback", feedbackSchema);