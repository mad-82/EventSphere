const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    expoId: { type: mongoose.Schema.Types.ObjectId, ref: "Expo", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Ticket Details
    ticketType: { type: String, enum: ["Standard", "VIP"], required: true },
    quantity: { type: Number, default: 1 },
    ticketPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    // Identifiers
    bookingReference: { type: String, required: true, unique: true },
    ticketId: { type: String, required: true, unique: true },

    // Status
       bookingStatus: {
      type: String,
      enum: [
        "Confirmed",
        "Pending Payment Verification",
        "Cancelled",
        "Checked-In",           // ✅ NEW
      ],
      default: "Confirmed",
    },
    checkedInAt: { type: Date, default: null },   // ✅ NEW
    paymentStatus: {
      type: String,
      enum: [
        "Not Applicable",
        "Paid",
        "Pending Verification",
        "Verified",
        "Rejected",
      ],
      default: "Not Applicable",
    },

    // Attendee Info
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    organization: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    specialRequirements: { type: String, default: "" },
    hearAboutUs: { type: String, default: "" },

    // VIP Payment Info
    paymentDetails: {
      senderName: String,
      senderBankName: String,
      senderAccountTitle: String,
      senderAccountLast4: String,
      transactionRef: String,
      amountTransferred: Number,
      paymentDate: String,
      paymentTime: String,
      notes: String,
    },
  },
  { timestamps: true, collection: "tickets" }
);

registrationSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model(
  "AttendeeRegistration",
  registrationSchema,
  "tickets"
);