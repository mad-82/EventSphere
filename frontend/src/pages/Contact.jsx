import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, ShieldCheck } from "lucide-react";
import api from "../services/api"; 
import "./Contact.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      // ✅ URL FIXED YAHAN HAI
      await api.post("/attendee/contact", form);
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      {/* HERO */}
      <section className="contact-hero">
        <div className="hero-decorative-circle circle-1"></div>
        <div className="hero-decorative-grid"></div>
        <div className="container text-center position-relative z-1">
          <span className="badge-dark mb-3">Get in Touch</span>
          <h1 className="contact-title">We'd love to hear from you.</h1>
          <p className="contact-subtitle">
            Have a question about EventStrat.ai? Need help with an event? Our team is here to assist you.
          </p>
        </div>
      </section>

      <div className="container contact-content">
        <div className="row g-5">
          {/* LEFT: Contact Info */}
          <div className="col-lg-5">
            <div className="info-box animated-section">
              <h3 className="section-heading mb-4">Contact Information</h3>
              
              <div className="contact-item">
                <div className="contact-icon"><Mail size={20} /></div>
                <div>
                  <h6>Email Us</h6>
                  <p>madihaayub192@gmail.com</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon"><Phone size={20} /></div>
                <div>
                  <h6>Call Us</h6>
                  <p>+92 300 1234567</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon"><MapPin size={20} /></div>
                <div>
                  <h6>Visit Us</h6>
                  <p>Karachi, Pakistan</p>
                </div>
              </div>

              <div className="mt-5 p-4 rounded border border-secondary border-opacity-25 bg-dark bg-opacity-25">
                <h6 className="text-white d-flex align-items-center gap-2">
                  <ShieldCheck size={18} className="text-success" /> Premium Support
                </h6>
                <p className="text-muted small mb-0 mt-2">
                  Organizers and Exhibitors get priority 24/7 support. Log in to your dashboard to access live chat.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Contact Form */}
          <div className="col-lg-7">
            <div className="form-box animated-section">
              <h3 className="section-heading mb-4">Send us a Message</h3>
              
              {status === "success" && (
                <div className="alert alert-success bg-success bg-opacity-10 border-success text-success">
                  Message sent successfully! We will get back to you soon.
                </div>
              )}
              {status === "error" && (
                <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger">
                  Failed to send message. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input type="text" name="name" className="form-control custom-input" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email Address</label>
                    <input type="email" name="email" className="form-control custom-input" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Subject</label>
                    <input type="text" name="subject" className="form-control custom-input" value={form.subject} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Message</label>
                    <textarea name="message" rows="5" className="form-control custom-input" value={form.message} onChange={handleChange} required></textarea>
                  </div>
                  <div className="col-12 mt-5">
                    <button type="submit" className="btn-premium-primary w-100" disabled={loading}>
                      {loading ? "Sending..." : "Send Message"} <Send size={18} className="ms-2" />
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