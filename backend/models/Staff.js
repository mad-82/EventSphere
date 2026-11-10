const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    exhibitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true },
    role: { type: String, default: "Sales Lead" },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

staffSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Staff", staffSchema);