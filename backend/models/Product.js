const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    exhibitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    kind: { type: String, enum: ["Product", "Service"], default: "Product" },
    category: { type: String, required: true },
    price: { type: String, default: "" },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

productSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Product", productSchema);