const Message = require("../models/Message");

/* ============================================================
   GET /api/messages
   Logged-in user (Exhibitor ya Attendee) apni saari conversations dekhe
   ============================================================ */
async function getMyConversations(req, res, next) {
  try {
    const conversations = await Message.find({ exhibitor: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, count: conversations.length, conversations });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   POST /api/messages
   Nayi inquiry create kare
   ============================================================ */
async function createConversation(req, res, next) {
  try {
    const { subject, category, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: "Subject and message are required." });
    }

    // ✅ Determine from field based on user role
    const fromField = req.user.role === "attendee" ? "attendee" : "exhibitor";

    const conversation = await Message.create({
      exhibitor: req.user._id,
      subject,
      category: category || "General Inquiry",
      status: "open",
      messages: [{ from: fromField, body: message }],
    });

    res.status(201).json({ success: true, message: "Inquiry sent.", conversation });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   POST /api/messages/:id/reply
   Exhibitor / Attendee kisi conversation me reply kare
   ============================================================ */
async function replyToConversation(req, res, next) {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ success: false, message: "Reply cannot be empty." });

    const conversation = await Message.findOne({ _id: req.params.id, exhibitor: req.user._id });
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found." });

    // ✅ Determine from field based on user role
    const fromField = req.user.role === "attendee" ? "attendee" : "exhibitor";

    conversation.messages.push({ from: fromField, body });
    if (conversation.status === "resolved") conversation.status = "in_progress"; // reopen

    await conversation.save();
    res.json({ success: true, message: "Reply sent.", conversation });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET /api/messages/admin/all
   Admin saari conversations dekhe
   ============================================================ */
async function getAllConversations(req, res, next) {
  try {
    const conversations = await Message.find()
      .populate("exhibitor", "name email companyName role")
      .sort({ updatedAt: -1 });
    res.json({ success: true, count: conversations.length, conversations });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   POST /api/messages/admin/:id/reply
   Admin reply kare
   ============================================================ */
async function adminReply(req, res, next) {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ success: false, message: "Reply cannot be empty." });

    const conversation = await Message.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found." });

    conversation.messages.push({ from: "organizer", body });
    if (conversation.status === "resolved") conversation.status = "in_progress";

    await conversation.save();
    
    const populated = await Message.findById(conversation._id).populate("exhibitor", "name email companyName role");
    res.json({ success: true, message: "Reply sent.", conversation: populated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyConversations,
  createConversation,
  replyToConversation,
  getAllConversations,
  adminReply,
};