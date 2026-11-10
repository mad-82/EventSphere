const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    exhibitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expo",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "draft"],
      default: "pending",
    },
    boothType: { type: String, default: "" },
    boothSize: { type: String, default: "" },
    staffCount: { type: Number, default: 0 },
    products: [{ type: String }],
    services: [{ type: String }],
    notes: { type: String, default: "" },
    documents: [
      {
        name: { type: String, required: true },
        size: { type: Number },
        url: { type: String, default: "" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

// Ek exhibitor ek expo ke liye sirf ek active application rakh sakta hai
applicationSchema.index({ exhibitor: 1, expoId: 1 });

applicationSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// ✅✅✅ YEH LINE SABSE IMPORTANT HAI — ISKE BAGHAIR `countDocuments` ERROR AAYEGA ✅✅✅
module.exports = mongoose.model("Application", applicationSchema);