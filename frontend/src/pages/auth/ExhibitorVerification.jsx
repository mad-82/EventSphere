import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import exhibitorService from "../../services/exhibitorService";
import authService from "../../services/authService";
import "./ExhibitorVerification.css";

export default function ExhibitorVerification() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    companyName: "",
    registrationNumber: "",
    establishedYear: "",
    website: "",
    country: "",
    city: "",
    address: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // 1. Exhibitor ki details save karo
      await exhibitorService.updateMyProfile(form);
      
      // 2. User ko verified mark karo
      await authService.updateProfile({ isVerifiedExhibitor: true });
      
      // 3. User state refresh karo (taake ProtectedRoute ko pata chale ke verify ho gaya)
      await refreshUser();
      
      // 4. Ab Dashboard pe jao
      navigate("/exhibitor/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Failed to save verification details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="verify-header">
          <div className="verify-icon"><ShieldCheck size={32} /></div>
          <h1>Company Verification</h1>
          <p>To maintain a professional network, please provide your official company details.</p>
        </div>

        <form onSubmit={handleSubmit} className="verify-form">
          <div className="verify-row">
            <div className="verify-group">
              <label>Company Registered Name *</label>
              <input required value={form.companyName} onChange={(e) => setForm({...form, companyName: e.target.value})} placeholder="e.g. Meridian Industrial Ltd." />
            </div>
            <div className="verify-group">
              <label>Registration / Tax Number *</label>
              <input required value={form.registrationNumber} onChange={(e) => setForm({...form, registrationNumber: e.target.value})} placeholder="e.g. NTN-1234567-8" />
            </div>
          </div>

          <div className="verify-row">
            <div className="verify-group">
              <label>Established Year *</label>
              <input type="number" required value={form.establishedYear} onChange={(e) => setForm({...form, establishedYear: e.target.value})} placeholder="e.g. 2015" />
            </div>
            <div className="verify-group">
              <label>Official Website</label>
              <input value={form.website} onChange={(e) => setForm({...form, website: e.target.value})} placeholder="https://company.com" />
            </div>
          </div>

          <div className="verify-row">
            <div className="verify-group">
              <label>Country *</label>
              <input required value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} placeholder="e.g. Pakistan" />
            </div>
            <div className="verify-group">
              <label>City *</label>
              <input required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} placeholder="e.g. Karachi" />
            </div>
          </div>

          <div className="verify-group">
            <label>Head Office Address *</label>
            <input required value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="Complete physical address" />
          </div>

          <div className="verify-note">
            <p>By continuing, you confirm that you are an authorized representative of this company.</p>
          </div>

          <button type="submit" className="verify-btn" disabled={saving}>
            {saving ? "Verifying..." : "Complete Verification & Enter Dashboard"} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}