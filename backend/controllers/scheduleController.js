const Session = require("../models/Session");

// 1. GET ALL SESSIONS (Public & Admin)
async function listSessions(req, res, next) {
  try {
    const filter = {};
    // Check karein ke expoId query mein aayi hai ya nahi
    if (req.query.expoId) {
      filter.expoId = req.query.expoId;
    }
    
    const sessions = await Session.find(filter).sort({ date: 1, startTime: 1 });
    res.json({ success: true, count: sessions.length, sessions });
  } catch (err) {
    next(err);
  }
}

// 2. CREATE SESSION (Admin Only)
async function createSession(req, res, next) {
  try {
    const { expoId, title, speaker, date, startTime, endTime, room } = req.body;
    
    if (!expoId || !title || !speaker || !date || !startTime || !endTime || !room) {
      return res.status(400).json({ success: false, message: "Missing required fields for session." });
    }

    const session = await Session.create(req.body);
    res.status(201).json({ success: true, message: "Session created successfully.", session });
  } catch (err) {
    next(err);
  }
}

// 3. UPDATE SESSION (Admin Only) <-- Ye naya add kiya hai
async function updateSession(req, res, next) {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });
    res.json({ success: true, message: "Session updated.", session });
  } catch (err) {
    next(err);
  }
}

// 4. DELETE SESSION (Admin Only)
async function deleteSession(req, res, next) {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });
    res.json({ success: true, message: "Session deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { listSessions, createSession, updateSession, deleteSession };