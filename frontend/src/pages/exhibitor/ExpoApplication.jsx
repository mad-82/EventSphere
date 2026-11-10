import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle2, AlertCircle, RefreshCw, Building2, CalendarDays, MapPin } from "lucide-react";
import eventService from "../../services/eventService";
import applicationService from "../../services/applicationService";
import "./ExpoApplication.css";

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function ExpoApplication() {
  const { expoId } = useParams();
  const navigate = useNavigate();

  const [expo, setExpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    boothType: "Standard",
    boothSize: "9x9",
    staffCount: 1,
    notes: "",
  });

  useEffect(() => {
    async function loadExpo() {
      try {
        const res = await eventService.getById(expoId);
        setExpo(res.expo || res.data);
      } catch (err) {
        setError(err?.message || "Failed to load expo details.");
      } finally {
        setLoading(false);
      }
    }
    loadExpo();
  }, [expoId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await applicationService.create({
        expoId,
        ...form,
        staffCount: Number(form.staffCount),
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="exb-app-page"><div className="exb-app-page__loading"><RefreshCw className="exb-spin" /> Loading...</div></div>;
  if (error && !expo) return <div className="exb-app-page"><div className="exb-app-page__error"><AlertCircle /> {error}</div></div>;

  if (success) {
    return (
      <div className="exb-app-page">
        <div className="exb-app-success">
          <div className="exb-app-success__icon"><CheckCircle2 size={48} /></div>
          <h1>Application Submitted!</h1>
          <p>Your application for <strong>{expo?.title}</strong> has been sent to the organizer for review.</p>
          <div className="exb-app-success__actions">
            <button className="exb-btn exb-btn--primary" onClick={() => navigate("/exhibitor/my-applications")}>View My Applications</button>
            <button className="exb-btn exb-btn--ghost" onClick={() => navigate("/exhibitor/browse-expos")}>Browse More Expos</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exb-app-page">
      <button className="exb-app-page__back" onClick={() => navigate("/exhibitor/browse-expos")}>
        <ArrowLeft size={16} /> Back to Browse
      </button>

      <div className="exb-app-layout">
        <div className="exb-app-form-wrap">
          <div className="exb-app-form__header">
            <h1>Apply for {expo?.title}</h1>
            <p>Fill out the details below to request participation.</p>
          </div>

          {error && <div className="exb-app-form__error"><AlertCircle size={16} /> {error}</div>}

          <form onSubmit={handleSubmit} className="exb-app-form">
            <div className="exb-app-form__group">
              <label>Booth Type</label>
              <select name="boothType" value={form.boothType} onChange={handleChange}>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Corner">Corner</option>
                <option value="Island">Island</option>
              </select>
            </div>

            <div className="exb-app-form__group">
              <label>Booth Size</label>
              <select name="boothSize" value={form.boothSize} onChange={handleChange}>
                <option value="6x6">6x6 m²</option>
                <option value="9x9">9x9 m²</option>
                <option value="12x12">12x12 m²</option>
              </select>
            </div>

            <div className="exb-app-form__group">
              <label>Expected Staff Count</label>
              <input type="number" min="1" max="50" name="staffCount" value={form.staffCount} onChange={handleChange} />
            </div>

            <div className="exb-app-form__group exb-app-form__group--full">
              <label>Special Requirements / Notes</label>
              <textarea name="notes" rows={4} value={form.notes} onChange={handleChange} placeholder="Any specific requirements? (e.g. extra power, corner booth)" />
            </div>

            <div className="exb-app-form__actions">
              <button type="button" className="exb-btn exb-btn--ghost" onClick={() => navigate(-1)} disabled={submitting}>Cancel</button>
              <button type="submit" className="exb-btn exb-btn--primary" disabled={submitting}>
                {submitting ? "Submitting..." : <><Send size={16} /> Submit Application</>}
              </button>
            </div>
          </form>
        </div>

        <div className="exb-app-summary">
          <h3>Event Summary</h3>
          <div className="exb-app-summary__img">
            {getImageUrl(expo?.cover || expo?.coverImage) ? (
              <img src={getImageUrl(expo?.cover || expo?.coverImage)} alt="cover" />
            ) : (
              <Building2 size={40} />
            )}
          </div>
          <h4>{expo?.title}</h4>
          <p>{expo?.description}</p>
          <ul>
            <li><MapPin size={14} /> {expo?.venue}, {expo?.location}</li>
            <li><CalendarDays size={14} /> {new Date(expo?.startDate).toLocaleDateString()} - {new Date(expo?.endDate).toLocaleDateString()}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}