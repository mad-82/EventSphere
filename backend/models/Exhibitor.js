const mongoose = require("mongoose");

const exhibitorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: { type: String, default: "", trim: true },
    industry: { type: String, default: "" },
    description: { type: String, default: "" },
    mission: { type: String, default: "" },
    category: { type: String, default: "" },
    logo: { type: String, default: "" },
    website: { type: String, default: "" },
    registrationNumber: { type: String, default: "" },
    establishedYear: { type: Number, default: null },
    companySize: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    altContact: { type: String, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    address: { type: String, default: "" },
    socials: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

exhibitorSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Exhibitor", exhibitorSchema);