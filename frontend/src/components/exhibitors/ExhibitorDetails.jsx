import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api"; 
import "./ExhibitorDetailPage.css";

export default function ExhibitorDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/exhibitors/${id}`)
      .then(res => {
        setData(res.data.exhibitor);
      })
      .catch(err => {
        console.error(err);
        setError("Could not load exhibitor details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="ex-detail-wrapper text-center py-5"><h3>Loading Profile...</h3></div>;
  if (error) return <div className="ex-detail-wrapper text-center py-5"><h3 className="text-danger">{error}</h3></div>;
  if (!data) return null;

  const { user, companyName, industry, description, website, logo, country, city, address, socials, mission, establishedYear, companySize } = data;

  return (
    <div className="ex-detail-wrapper">
      <div className="container py-5">
        <Link to={-1} className="btn btn-outline-light mb-4" style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
          ← Back to Event
        </Link>

        <div className="ex-profile-card">
          
          {/* Header Section */}
          <div className="ex-header">
            {logo ? (
              <img src={logo} alt="Logo" className="ex-logo" />
            ) : (
              <div className="ex-avatar-fallback">{(companyName || user?.name || "C")[0]}</div>
            )}
            <div>
              <h1>{companyName || user?.name || "Company Name"}</h1>
              <p className="text-secondary mb-1">
                {industry || "Industry Not Specified"} {city && country ? `· ${city}, ${country}` : ""}
              </p>
              {user?.isVerifiedExhibitor && (
                <span className="badge bg-success mt-2">Verified Exhibitor</span>
              )}
            </div>
          </div>

          <div className="row g-4 mt-4">
            
            {/* Main Details */}
            <div className="col-lg-8">
              <div className="ex-section">
                <h4>About Company</h4>
                <p>{description || "No description provided."}</p>
                {mission && (
                  <>
                    <h5 className="mt-4" style={{ color: "#97BFD9" }}>Our Mission</h5>
                    <p>{mission}</p>
                  </>
                )}
              </div>

              <div className="ex-section mt-4">
                <h4>Contact Information</h4>
                <ul className="ex-contact-list">
                  <li><strong>Representative:</strong> {user?.name || "N/A"}</li>
                  <li><strong>Email:</strong> <a href={`mailto:${user?.email}`}>{user?.email || "N/A"}</a></li>
                  <li><strong>Phone:</strong> {user?.phone || "N/A"}</li>
                  {address && <li><strong>Address:</strong> {address}</li>}
                </ul>
              </div>
            </div>

            {/* Sidebar / Extra Info */}
            <div className="col-lg-4">
              <div className="ex-sidebar">
                <h4>Company Details</h4>
                <ul>
                  {website && (
                    <li>
                      <strong>Website:</strong> <br/>
                      <a href={website} target="_blank" rel="noreferrer">{website}</a>
                    </li>
                  )}
                  {companySize && <li><strong>Company Size:</strong> <br/>{companySize}</li>}
                  {establishedYear && <li><strong>Established:</strong> <br/>{establishedYear}</li>}
                </ul>

                {/* Social Links */}
                {(socials?.linkedin || socials?.twitter || socials?.instagram) && (
                  <div className="mt-4">
                    <h5 style={{ fontSize: "14px", color: "#A7B0C0" }}>SOCIAL LINKS</h5>
                    <div className="d-flex gap-2 mt-2">
                      {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noreferrer" className="badge bg-primary text-decoration-none">LinkedIn</a>}
                      {socials.twitter && <a href={socials.twitter} target="_blank" rel="noreferrer" className="badge bg-info text-dark text-decoration-none">Twitter</a>}
                      {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" className="badge bg-danger text-decoration-none">Instagram</a>}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}