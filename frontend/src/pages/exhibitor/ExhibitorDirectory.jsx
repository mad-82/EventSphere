import { useState, useEffect } from "react";
import { Search, Building2, MapPin, Globe, Mail, Filter, RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import exhibitorService from "../../services/exhibitorService";
import "./ExhibitorDirectory.css";

export default function ExhibitorDirectory() {
  const [exhibitors, setExhibitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    async function loadDirectory() {
      try {
        const res = await exhibitorService.list();
        setExhibitors(res.exhibitors || []);
      } catch (err) {
        setError(err?.message || "Failed to load directory.");
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, []);

  const industries = ["all", ...Array.from(new Set(exhibitors.map((e) => e.industry).filter(Boolean)))];

  const filtered = exhibitors.filter((e) => {
    const matchesSearch =
      e.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = industryFilter === "all" || e.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  if (loading) return <div className="dir-page"><div className="dir-loading"><RefreshCw className="exb-spin" /> Loading directory...</div></div>;
  if (error) return <div className="dir-page"><div className="dir-error"><AlertCircle size={24} /> {error}</div></div>;

  // ✅ Agar View Profile pe click hua hai, to Full Profile dikhao
  if (selectedCompany) {
    return <CompanyProfileView company={selectedCompany} onBack={() => setSelectedCompany(null)} />;
  }

  return (
    <div className="dir-page">
      <header className="dir-header">
        <div>
          <h1>Exhibitor Directory</h1>
          <p>Discover companies, products, and services from other exhibitors.</p>
        </div>
        <div className="dir-count"><strong>{filtered.length}</strong> companies</div>
      </header>

      <section className="dir-toolbar">
        <div className="dir-search">
          <Search size={16} />
          <input type="text" placeholder="Search by company name or description..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="dir-filter">
          <Filter size={14} />
          <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
            {industries.map((ind) => <option key={ind} value={ind}>{ind === "all" ? "All Industries" : ind}</option>)}
          </select>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="dir-empty">
          <Building2 size={48} />
          <h3>No companies found</h3>
        </div>
      ) : (
        <div className="dir-grid">
          {filtered.map((ex) => {
            const logoInitial = ex.companyName ? ex.companyName.charAt(0).toUpperCase() : "C";
            return (
              <div key={ex._id || ex.id} className="dir-card" onClick={() => setSelectedCompany(ex)}>
                <div className="dir-card__banner" style={{ background: "linear-gradient(135deg, #0f172a, #334155)" }}></div>
                <div className="dir-card__content">
                  <div className="dir-card__avatar">
                    {ex.logo ? <img src={ex.logo} alt={ex.companyName} /> : <span>{logoInitial}</span>}
                  </div>
                  <h3 className="dir-card__title">{ex.companyName || "Unknown Company"}</h3>
                  <div className="dir-card__tags">
                    {ex.industry && <span className="dir-tag">{ex.industry}</span>}
                    {ex.city && <span className="dir-tag dir-tag--location"><MapPin size={10} /> {ex.city}</span>}
                  </div>
                  <p className="dir-card__desc">
                    {ex.description || "No description provided. Click to view full profile."}
                  </p>
                  <div className="dir-card__actions">
                    <button className="dir-btn">View Profile</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ✅ FULL COMPANY PROFILE VIEW */
function CompanyProfileView({ company, onBack }) {
  const logoInitial = company.companyName ? company.companyName.charAt(0).toUpperCase() : "C";

  return (
    <div className="dir-profile-view">
      <button className="dir-back-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Directory
      </button>

      {/* Hero Section */}
      <section className="dir-profile-hero-container">
        {/* Cover Banner */}
        <div className="dir-profile-cover" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}></div>
        
        <div className="dir-profile-hero">
          <div className="dir-profile-logo">
            {company.logo ? <img src={company.logo} alt={company.companyName} /> : <span>{logoInitial}</span>}
          </div>
          <div className="dir-profile-identity">
            <h1>{company.companyName || "Untitled Company"}</h1>
            <p className="dir-profile-tagline">
              {company.category || "General"} {company.industry ? `· ${company.industry}` : ""}
            </p>
            <div className="dir-profile-meta">
              {company.city && <span><MapPin size={14} /> {company.city}{company.country ? `, ${company.country}` : ""}</span>}
              {company.website && <a href={company.website} target="_blank" rel="noreferrer"><Globe size={14} /> {company.website.replace(/^https?:\/\//, "")}</a>}
            </div>
          </div>
        </div>
      </section>

      {/* Details Sections */}
      <div className="dir-profile-sections">
        <section className="dir-profile-section">
          <h2>Company Overview</h2>
          <p>
            {company.description || 
              `${company.companyName} is a verified exhibitor operating in the ${company.industry || "business"} sector. They have not added a detailed description yet, but you can reach out to them using the contact details below.`}
          </p>
        </section>

        <section className="dir-profile-section">
          <h2>Contact Details</h2>
          <div className="dir-profile-contact">
            {company.email ? (
              <div><Mail size={18} /> <a href={`mailto:${company.email}`}>{company.email}</a></div>
            ) : (
              <div><Mail size={18} /> <span style={{color: '#94a3b8'}}>Email not provided</span></div>
            )}
            {company.phone ? (
              <div><Globe size={18} /> <span>{company.phone}</span></div>
            ) : (
              <div><Globe size={18} /> <span style={{color: '#94a3b8'}}>Phone not provided</span></div>
            )}
            {company.address ? (
              <div><MapPin size={18} /> <span>{company.address}</span></div>
            ) : (
              <div><MapPin size={18} /> <span style={{color: '#94a3b8'}}>Address not provided</span></div>
            )}
          </div>
        </section>

        {company.mission && (
          <section className="dir-profile-section">
            <h2>Mission Statement</h2>
            <p>{company.mission}</p>
          </section>
        )}
      </div>
    </div>
  );
}