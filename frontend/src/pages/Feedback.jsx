import { useState } from "react";
import { Star, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../services/api";
import "./Feedback.css";

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", category: "Event Experience", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setStatus("no-rating");
    
    setLoading(true);
    try {
      // ✅ Data properly map karke bheja hai
      await api.post("/attendee/feedback-guest", { 
        name: form.name,
        email: form.email,
        category: form.category,
        message: form.message,
        rating: Number(rating)
      });
      
      setStatus("success");
      setForm({ name: "", email: "", category: "Event Experience", message: "" });
      setRating(0);
    } catch (err) {
      console.error("Feedback submit error:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-page-wrapper">
      {/* HERO */}
      <section className="feedback-hero">
        <div className="hero-decorative-circle circle-1"></div>
        <div className="container text-center position-relative z-1">
          <span className="badge-dark mb-3">We Value Your Voice</span>
          <h1 className="feedback-title">How was your experience?</h1>
          <p className="feedback-subtitle">
            Your feedback helps us improve EventStrat.ai and make future events even better.
          </p>
        </div>
      </section>

      <div className="container feedback-content">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="form-box animated-section">
              <h3 className="section-heading text-center mb-5">Submit Feedback</h3>

              {status === "success" && (
                <div className="alert alert-success bg-success bg-opacity-10 border-success text-success text-center">
                  <CheckCircle2 size={24} className="mb-2" />
                  <h5>Thank you!</h5>
                  <p className="mb-0">Your feedback has been sent directly to the admin.</p>
                </div>
              )}
              {status === "error" && (
                <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger text-center">
                  <AlertCircle size={24} className="mb-2" />
                  <p className="mb-0">Something went wrong. Please try again.</p>
                </div>
              )}
              {status === "no-rating" && (
                <div className="alert alert-warning bg-warning bg-opacity-10 border-warning text-warning text-center">
                  Please select a star rating before submitting.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Star Rating */}
                <div className="text-center mb-5">
                  <label className="form-label d-block mb-3 text-white">Rate your overall experience *</label>
                  <div className="d-flex justify-content-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={`star-btn ${star <= (hover || rating) ? "star-active" : ""}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                      >
                        <Star size={36} fill={star <= (hover || rating) ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control custom-input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control custom-input" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Feedback Category</label>
                    <select className="form-select custom-input" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                      <option>Event Experience</option>
                      <option>Platform Usability</option>
                      <option>Booth Management</option>
                      <option>Support & Help</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Your Message</label>
                    <textarea className="form-control custom-input" rows="5" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} required></textarea>
                  </div>
                  <div className="col-12 mt-5">
                    <button type="submit" className="btn-premium-primary w-100" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Feedback"} <MessageSquare size={18} className="ms-2" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}