import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  MapPin,
  Globe,
  Link as LinkIcon,
  Save,
  Camera,
  CheckCircle2,
  Sparkles,
  Info,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import exhibitorService from "../../services/exhibitorService";
import "./ExhibitorProfile.css";

/* ---------- helpers ---------- */
function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function computeCompletion(c) {
  if (!c) return 0;
  const fields = [
    c.companyName, c.industry, c.registrationNumber, c.establishedYear,
    c.companySize, c.website, c.description, c.mission, c.category,
    c.email, c.phone, c.country, c.city, c.address,
  ];
  const filled = fields.filter((v) => v != null && String(v).trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RX = /^https?:\/\/.+/i;

export default function ExhibitorProfile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [company, setCompany] = useState(null);
  const [draft, setDraft] = useState({});
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const toastTimer = useRef(null);
  const logoInputRef = useRef(null);

  /* ---------- load profile ---------- */
  async function loadProfile() {
    setLoading(true);
    setError(null);
    try {
      const res = await exhibitorService.getMyProfile();
      setCompany(res.exhibitor);
      setDraft(res.exhibitor || {});
    } catch (err) {
      setError(err?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!toast) return;
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(toastTimer.current);
  }, [toast]);

  const completion = useMemo(() => computeCompletion(company), [company]);

  const setField = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const setSocial = (key, value) => {
    setDraft((d) => ({ ...d, socials: { ...(d.socials || {}), [key]: value } }));
  };

  const validate = () => {
    const e = {};
    if (!draft.companyName?.trim()) e.companyName = "Company name is required.";
    if (!draft.industry?.trim()) e.industry = "Industry is required.";
    if (!draft.email?.trim()) e.email = "Email is required.";
    else if (!EMAIL_RX.test(draft.email.trim())) e.email = "Enter a valid email.";
    if (draft.website && !URL_RX.test(draft.website.trim())) e.website = "Website must start with http:// or https://";
    if (draft.establishedYear) {
      const y = Number(draft.establishedYear);
      const now = new Date().getFullYear();
      if (!Number.isFinite(y) || y < 1800 || y > now) e.establishedYear = `Year must be between 1800 and ${now}.`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setToast({ type: "error", message: "Please fill all required fields correctly." });
      return;
    }
    setSaving(true);
    try {
      const res = await exhibitorService.updateMyProfile(draft);
      setCompany(res.exhibitor);
      setToast({ type: "success", message: "Company profile saved successfully." });
    } catch (err) {
      setToast({ type: "error", message: err?.message || "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- logo upload ---------- */
  const handleLogoPick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: "error", message: "Logo must be under 2 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setField("logo", reader.result);
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="exb-profile">
        <div className="exb-profile__loading">
          <RefreshCw size={20} className="exb-spin" />
          <span>Loading company profile…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exb-profile">
        <div className="exb-profile__error">
          <AlertCircle size={32} />
          <h2>Couldn't load profile</h2>
          <p>{error}</p>
          <button className="exb-btn exb-btn--primary" onClick={loadProfile}>
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exb-profile">
      {toast && (
        <div className={`exb-profile__toast exb-profile__toast--${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <Info size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero */}
      <section className="exb-profile__hero">
        <div className="exb-profile__hero-left">
          <div className="exb-profile__logo" onClick={handleLogoPick}>
            {draft.logo ? (
              <img src={draft.logo} alt="Company logo" />
            ) : (
              <span>{initials(draft.companyName || "Company")}</span>
            )}
            <span className="exb-profile__logo-overlay">
              <Camera size={18} /> Change
            </span>
          </div>
          <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />

          <div className="exb-profile__identity">
            <h1 className="exb-profile__name">
              {draft.companyName || "Untitled Company"}
            </h1>
            <p className="exb-profile__tagline">
              {draft.category || "—"}
              {draft.industry ? ` · ${draft.industry}` : ""}
            </p>
            <div className="exb-profile__meta">
              {draft.city && (
                <span>
                  <MapPin size={13} /> {draft.city}{draft.country ? `, ${draft.country}` : ""}
                </span>
              )}
              {draft.website && (
                <a href={draft.website} target="_blank" rel="noreferrer">
                  <Globe size={13} /> {draft.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="exb-profile__hero-right">
          <div className="exb-profile__completion">
            <div className="exb-profile__completion-head">
              <span>Profile Completion</span>
              <strong>{completion}%</strong>
            </div>
            <div className="exb-profile__completion-track">
              <div className="exb-profile__completion-fill" style={{ width: `${completion}%` }} />
            </div>
            {completion < 100 && (
              <p className="exb-profile__completion-hint">
                <Sparkles size={13} /> Complete your profile for higher visibility.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Identity */}
      <Section title="Company Identity" icon={<Building2 size={16} />}>
        <Field label="Company Name" required error={errors.companyName}>
          <input type="text" value={draft.companyName || ""} onChange={(e) => setField("companyName", e.target.value)} placeholder="e.g. Meridian Industrial Systems" />
        </Field>
        <Field label="Industry" required error={errors.industry}>
          <input type="text" value={draft.industry || ""} onChange={(e) => setField("industry", e.target.value)} placeholder="e.g. Industrial Technology" />
        </Field>
        <Field label="Registration Number">
          <input type="text" value={draft.registrationNumber || ""} onChange={(e) => setField("registrationNumber", e.target.value)} placeholder="e.g. PK-REG-2018-44219" />
        </Field>
        <Field label="Established Year" error={errors.establishedYear}>
          <input type="number" value={draft.establishedYear || ""} onChange={(e) => setField("establishedYear", e.target.value)} placeholder="e.g. 2016" />
        </Field>
        <Field label="Company Size">
          <select value={draft.companySize || ""} onChange={(e) => setField("companySize", e.target.value)}>
            <option value="">Select size</option>
            <option>1–10 employees</option>
            <option>11–50 employees</option>
            <option>51–200 employees</option>
            <option>201–500 employees</option>
            <option>501–1000 employees</option>
            <option>1000+ employees</option>
          </select>
        </Field>
        <Field label="Website" error={errors.website}>
          <input type="url" value={draft.website || ""} onChange={(e) => setField("website", e.target.value)} placeholder="https://example.com" />
        </Field>
        <Field label="Business Category">
          <input type="text" value={draft.category || ""} onChange={(e) => setField("category", e.target.value)} placeholder="e.g. Automation & IoT" />
        </Field>
      </Section>

      {/* Description */}
      <Section title="Company Description" icon={<FileText size={16} />} full>
        <Field label="Company Overview" full>
          <textarea rows={4} value={draft.description || ""} onChange={(e) => setField("description", e.target.value)} placeholder="Describe what your company does..." />
        </Field>
        <Field label="Mission / Introduction" full>
          <textarea rows={3} value={draft.mission || ""} onChange={(e) => setField("mission", e.target.value)} placeholder="Your company mission or introduction..." />
        </Field>
      </Section>

      {/* Contact */}
      <Section title="Contact Details" icon={<MapPin size={16} />}>
        <Field label="Official Email" required error={errors.email}>
          <input type="email" value={draft.email || ""} onChange={(e) => setField("email", e.target.value)} placeholder="hello@company.com" />
        </Field>
        <Field label="Phone">
          <input type="tel" value={draft.phone || ""} onChange={(e) => setField("phone", e.target.value)} placeholder="+92 21 1234 5678" />
        </Field>
        <Field label="Alternative Contact">
          <input type="tel" value={draft.altContact || ""} onChange={(e) => setField("altContact", e.target.value)} placeholder="+92 300 1234567" />
        </Field>
        <Field label="Country">
          <input type="text" value={draft.country || ""} onChange={(e) => setField("country", e.target.value)} placeholder="Pakistan" />
        </Field>
        <Field label="City">
          <input type="text" value={draft.city || ""} onChange={(e) => setField("city", e.target.value)} placeholder="Karachi" />
        </Field>
        <Field label="Full Address" full>
          <input type="text" value={draft.address || ""} onChange={(e) => setField("address", e.target.value)} placeholder="Street, area, postal code..." />
        </Field>
      </Section>

      {/* Social Links */}
      <Section title="Social Links" icon={<Globe size={16} />}>
        <Field label="LinkedIn">
          <div className="exb-profile__input-icon">
            <LinkIcon size={14} />
            <input type="url" value={draft.socials?.linkedin || ""} onChange={(e) => setSocial("linkedin", e.target.value)} placeholder="https://linkedin.com/company/..." />
          </div>
        </Field>
        <Field label="Twitter / X">
          <div className="exb-profile__input-icon">
            <LinkIcon size={14} />
            <input type="url" value={draft.socials?.twitter || ""} onChange={(e) => setSocial("twitter", e.target.value)} placeholder="https://twitter.com/..." />
          </div>
        </Field>
        <Field label="Instagram">
          <div className="exb-profile__input-icon">
            <LinkIcon size={14} />
            <input type="url" value={draft.socials?.instagram || ""} onChange={(e) => setSocial("instagram", e.target.value)} placeholder="https://instagram.com/..." />
          </div>
        </Field>
      </Section>

      {/* Save Button (Sticky) */}
      <div className="exb-profile__sticky-actions">
        <button className="exb-btn exb-btn--primary" onClick={handleSave} disabled={saving} style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: "15px" }}>
          <Save size={18} /> {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon, children, full }) {
  return (
    <section className={`exb-section ${full ? "exb-section--full" : ""}`}>
      <header className="exb-section__header">
        <span className="exb-section__icon">{icon}</span>
        <h2 className="exb-section__title">{title}</h2>
      </header>
      <div className="exb-section__grid">{children}</div>
    </section>
  );
}

function Field({ label, children, required, error, full }) {
  return (
    <label className={`exb-field ${full ? "exb-field--full" : ""}`}>
      <span className="exb-field__label">
        {label} {required && <em className="exb-field__req">*</em>}
      </span>
      {children}
      {error && <span className="exb-field__error">{error}</span>}
    </label>
  );
}