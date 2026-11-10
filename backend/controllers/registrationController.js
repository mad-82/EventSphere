const AttendeeRegistration = require("../models/AttendeeRegistration");
const Expo = require("../models/Expo");
const { sendEmail } = require("../services/emailService");

async function bookTicket(req, res, next) {
  try {
    const {
      expoId, ticketType, quantity,
      firstName, lastName, email, phone, country, city, organization, jobTitle,
      specialRequirements, hearAboutUs,
      senderName, senderBankName, senderAccountTitle, senderAccountLast4,
      transactionRef, amountTransferred, paymentDate, paymentTime, notes,
    } = req.body;

    const userId = req.user._id;

    const expo = await Expo.findById(expoId);
    if (!expo) return res.status(404).json({ success: false, message: "Event not found." });

    // Duplicate check
    const existing = await AttendeeRegistration.findOne({ expoId, userId });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already booked a ticket for this event." });
    }

    const qty = Number(quantity) || 1;
    const isVIP = ticketType === "VIP";
    const vipPrice = expo.vipPrice || 5000;
    const price = isVIP ? vipPrice : 0;
    const totalAmount = price * qty;

    // VIP Validation
    if (isVIP) {
      if (Number(amountTransferred) < totalAmount) {
        return res.status(400).json({ success: false, message: `Amount must be at least PKR ${totalAmount}.` });
      }
      if (!transactionRef || transactionRef.trim().length < 5) {
        return res.status(400).json({ success: false, message: "Please provide a valid Transaction ID." });
      }
    }

    // ✅ DIFFERENT STATUS for Free vs VIP
    const bookingStatus = isVIP ? "Pending Payment Verification" : "Confirmed";
    const paymentStatus = isVIP ? "Pending Verification" : "Not Applicable";

    const bookingReference = `BKG-${Date.now().toString().slice(-6)}`;
    const ticketId = `TKT-${Date.now().toString().slice(-8)}`;

    const registration = await AttendeeRegistration.create({
      expoId, userId, ticketType, quantity: qty, ticketPrice: price, totalAmount,
      bookingReference, ticketId, bookingStatus, paymentStatus,
      firstName, lastName, email, phone, country, city, organization, jobTitle, specialRequirements, hearAboutUs,
      paymentDetails: isVIP
        ? {
            senderName, senderBankName, senderAccountTitle, senderAccountLast4,
            transactionRef, amountTransferred: Number(amountTransferred),
            paymentDate, paymentTime, notes,
          }
        : undefined,
    });

    await Expo.findByIdAndUpdate(expoId, { $inc: { attendeeCount: qty } });

    // ✅ DIFFERENT EMAIL for Free vs VIP
    const emailSubject = isVIP
      ? `VIP Booking Received — Pending Verification — ${expo.title}`
      : `Your Standard Ticket is Confirmed — ${expo.title}`;

    const emailHtml = `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: #0B1220; padding: 20px; text-align: center;">
          <h1 style="color: #97BFD9; margin: 0;">EventSphere</h1>
        </div>
        <div style="background: white; padding: 30px;">
          <h2 style="color: #0B1220;">Hi ${firstName} ${lastName},</h2>
          ${
            isVIP
              ? `<p>Your <strong>VIP</strong> ticket booking has been received! ⏳</p>
                 <p><strong>Status:</strong> Pending Payment Verification</p>
                 <p>Our team will verify your bank transfer and confirm your VIP ticket shortly.</p>`
              : `<p>Your <strong>Standard</strong> ticket booking is successfully confirmed! 🎉</p>
                 <p><strong>Status:</strong> Confirmed</p>`
          }

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Event:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${expo.title}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Venue:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${expo.venue}, ${expo.location}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Ticket Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${ticketType} (x${qty})</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${totalAmount === 0 ? "FREE" : `PKR ${totalAmount}`}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Booking Ref:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingReference}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Ticket ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${ticketId}</td></tr>
          </table>

          <p>Please bring this email and your Ticket ID to the event.</p>
        </div>
      </div>
    `;

    sendEmail({ to: email, subject: emailSubject, html: emailHtml }).catch(console.log);

    res.status(201).json({
      success: true,
      message: isVIP ? "VIP booking submitted. Pending payment verification." : "Booking confirmed.",
      registration,
    });
  } catch (err) {
    next(err);
  }
}

async function getMyTickets(req, res, next) {
  try {
    const tickets = await AttendeeRegistration.find({ userId: req.user._id })
      .populate("expoId", "title startDate endDate location venue cover");
    res.json({ success: true, tickets });
  } catch (err) {
    next(err);
  }
}

module.exports = { bookTicket, getMyTickets };