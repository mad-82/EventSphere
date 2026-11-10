import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, MapPin, Globe, Mail, Phone, RefreshCw, AlertCircle } from "lucide-react";
import exhibitorService from "../../services/exhibitorService";
import boothService from "../../services/boothService";
import "./ExhibitorDetails.css";

export default function ExhibitorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exhibitor, setExhibitor] = useState(null);
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [listRes, boothsRes] = await Promise.all([
          exhibitorService.list(),
          boothService.list({}).catch(() => ({ booths: [] })),
        ]);

        const found = (listRes.exhibitors || []).find((e) => (e._id || e.id) === id);
        setExhibitor(found || null);

        const exBooths = (boothsRes.booths || []).filter(
          (b) => (b.reservedBy?._id || b.reservedBy) === id
        );
        setBooths(exBooths);
      } catch (err) {
        setError(err?.message || "Failed to load.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="exdet-page"><div className="exdet-loading"><RefreshCw className="att-spin" /> Loading...</div></div>;
  if (error || !exhibitor) return <div className="exdet-page"><div className="exdet-error"><AlertCircle /> Exhibitor not found.</div></div>;

  const logoInitial = exhibitor.companyName ? exhibitor.companyName.charAt(0).toUpperCase() : "C";

  return (
    <div className="exdet-page">
      <button className="exdet-back" onClick={() => navigate("/attendee/exhibitors")}>
        <ArrowLeft size={16} /> Back to Search
      </button>

      <div className="exdet-hero">
        <div className="exdet-cover"></div>
        <div className="exdet-hero-body">
          <div className="exdet-logo">
            {exhibitor.logo ? <img src={exhibitor.logo} alt={exhibitor.companyName} /> : logoInitial}
          </div>
          <div className="exdet-info">
            <h1>{exhibitor.companyName || "Unknown Company"}</h1>
            <p>{exhibitor.category || "General"} · {exhibitor.industry || "—"}</p>
            <div className="exdet-meta">
              {exhibitor.city && <span><MapPin size={14} /> {exhibitor.city}{exhibitor.country ? `, ${exhibitor.country}` : ""}</span>}
              {exhibitor.website && <a href={exhibitor.website} target="_blank" rel="noreferrer"><Globe size={14} /> Website</a>}
            </div>
          </div>
        </div>
      </div>

      <div className="exdet-sections">
        <section className="exdet-section">
          <h2>About Company</h2>
          <p>{exhibitor.description || "This company has not provided a description yet."}</p>
        </section>

        {booths.length > 0 && (
          <section className="exdet-section">
            <h2>Booth at Expo</h2>
            <div className="exdet-booths">
              {booths.map((b) => (
                <div key={b._id || b.id} className="exdet-booth-card">
                  <div className="exdet-booth-num">{b.boothNumber}</div>
                  <div>
                    <p><strong>{b.hall}</strong> · {b.floor}</p>
                    <p className="exdet-booth-loc">{b.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="exdet-section">
          <h2>Contact Details</h2>
          <div className="exdet-contacts">
            {exhibitor.email && <div><Mail size={16} /> <a href={`mailto:${exhibitor.email}`}>{exhibitor.email}</a></div>}
            {exhibitor.phone && <div><Phone size={16} /> {exhibitor.phone}</div>}
            {exhibitor.address && <div><MapPin size={16} /> {exhibitor.address}</div>}
          </div>
        </section>
      </div>
    </div>
  );
}