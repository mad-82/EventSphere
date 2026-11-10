import { useState, useEffect } from "react";
import { MessageSquare, Star, Send, RefreshCw, AlertCircle, CheckCircle2, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import feedbackService from "../../services/feedbackService";
import eventService from "../../services/eventService";
import "./FeedbackSupport.css";

export default function FeedbackSupport() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "organizer";
  const isAttendee = user?.role === "attendee";

  const [feedback, setFeedback] = useState([]);
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state (only for attendees)
  const [form, setForm] = useState({
    expoId: "",
    type: "event",
    rating: 5,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (isAdmin) {
          // ✅ Admin: saari feedback fetch karo
          const res = await feedbackService.getAll();
          setFeedback(res.feedback || []);
        } else {
          // ✅ Attendee: apni feedback aur expos (form ke liye)
          const [fbRes, expoRes] = await Promise.all([
            feedbackService.getMyFeedback().catch(() => ({ feedback: [] })),
            eventService.list().catch(() => ({ expos: [] })),
          ]);
          setFeedback(fbRes.feedback || []);
          setExpos(expoRes.expos || []);
        }
      } catch (err) {
        setError(err.message || "Failed to load feedback.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) return;
    setSubmitting(true);
    setSuccess(false);
    try {
      const res = await feedbackService.submit(form);
      setFeedback([res.feedback, ...feedback]);
      setForm({ expoId: "", type: "event", rating: 5, comment: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="fbs-page"><div className="fbs-loading"><RefreshCw className="att-spin" /> Loading...</div></div>;
  if (error) return <div className="fbs-page"><div className="fbs-error"><AlertCircle /> {error}</div></div>;

  return (
    <div className="fbs-page">
      <header className="fbs-header">
        <div>
          <h1>Feedback & Support</h1>
          <p>
            {isAdmin 
              ? "Review feedback submitted by attendees and exhibitors." 
              : "Share your experience or get help from our team."}
          </p>
        </div>
      </header>

      <div className={`fbs-grid ${isAdmin ? "fbs-grid--single" : ""}`}>
        
        {/* ✅ FORM: Sirf Attendee ke liye */}
        {isAttendee && (
          <div className="fbs-card">
            <div className="fbs-card__head">
              <h2>Submit Feedback</h2>
            </div>

            {success && (
              <div className="fbs-success">
                <CheckCircle2 size={16} /> Thank you! Your feedback has been submitted.
              </div>
            )}

            <form onSubmit={handleSubmit} className="fbs-form">
              {expos.length > 0 && (
                <div className="fbs-form__group">
                  <label>Which event? (Optional)</label>
                  <select
                    value={form.expoId}
                    onChange={(e) => setForm({ ...form, expoId: e.target.value })}
                  >
                    <option value="">General feedback</option>
                    {expos.map((e) => (
                      <option key={e._id || e.id} value={e._id || e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="fbs-form__group">
                <label>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="event">Event Feedback</option>
                  <option value="system">System Feedback</option>
                  <option value="support">Support Request</option>
                </select>
              </div>

              <div className="fbs-form__group">
                <label>Rating</label>
                <div className="fbs-stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`fbs-star ${n <= form.rating ? "is-active" : ""}`}
                      onClick={() => setForm({ ...form, rating: n })}
                    >
                      <Star size={24} fill={n <= form.rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="fbs-form__group">
                <label>Comment *</label>
                <textarea
                  required
                  rows={5}
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Tell us about your experience..."
                />
              </div>

              <button type="submit" className="fbs-btn fbs-btn--primary" disabled={submitting}>
                <Send size={16} /> {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          </div>
        )}

        {/* ✅ LIST: Admin aur Attendee dono ke liye */}
        <div className={`fbs-card ${isAdmin ? "fbs-card--full" : ""}`}>
          <div className="fbs-card__head">
            <h2>{isAdmin ? "All Feedback" : "Your Submissions"}</h2>
            <span className="fbs-count">{feedback.length}</span>
          </div>

          {feedback.length === 0 ? (
            <div className="fbs-empty">
              <MessageSquare size={40} />
              <p>No feedback has been submitted yet.</p>
            </div>
          ) : (
            <ul className="fbs-list">
              {feedback.map((fb) => (
                <li key={fb._id || fb.id} className="fbs-item">
                  <div className="fbs-item__head">
                    <div className="fbs-item__stars">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={13}
                          fill={n <= fb.rating ? "#f59e0b" : "none"}
                          color={n <= fb.rating ? "#f59e0b" : "#cbd5e1"}
                        />
                      ))}
                    </div>
                    <span className="fbs-item__type">{fb.type}</span>
                  </div>

                  {/* ✅ Admin ko User ka naam dikhao */}
                  {isAdmin && fb.user && (
                    <div className="fbs-item__user">
                      <User size={13} />
                      <strong>{fb.user.name}</strong>
                      <span>({fb.user.role})</span>
                    </div>
                  )}

                  <p className="fbs-item__comment">{fb.comment}</p>
                  <div className="fbs-item__meta">
                    {fb.expoId?.title && <span>{fb.expoId.title}</span>}
                    <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}