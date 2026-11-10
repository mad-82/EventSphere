const mongoose = require("mongoose");

const boothSchema = new mongoose.Schema(
  {
    expoId: { type: mongoose.Schema.Types.ObjectId, ref: "Expo", required: true },
    boothNumber: { type: String, required: true, trim: true },
    floor: { type: String, required: true, default: "Ground Floor" },
    hall: { type: String, required: true, default: "Main Hall" },
    size: { type: String, required: true, default: "9×9 m²" },
    totalArea: { type: String, default: "" },
    capacity: { type: String, default: "" },
    type: {
      type: String,
      enum: ["Standard", "Premium", "Corner", "Island", "Shell Scheme", "Raw Space"],
      default: "Standard",
    },
    price: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["Available", "Reserved", "Booked", "Occupied"],
      default: "Available",
    },
    facilities: { type: [String], default: [] },
    locationDetails: { type: String, default: "" },
    
    // ✅ NAYA FIELD: Booth Image
    image: { type: String, default: "" },

    gridPosition: {
      row: { type: Number, default: null },
      col: { type: Number, default: null },
    },

    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Ek Expo ke andar booth number duplicate na ho
boothSchema.index({ expoId: 1, boothNumber: 1 }, { unique: true });

boothSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Booth", boothSchema);