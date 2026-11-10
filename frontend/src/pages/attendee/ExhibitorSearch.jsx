import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, MapPin, Globe, Mail, Filter, RefreshCw, AlertCircle } from "lucide-react";
import exhibitorService from "../../services/exhibitorService";
import "./ExhibitorSearch.css";

export default function ExhibitorSearch() {
  const navigate = useNavigate();
  const [exhibitors, setExhibitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await exhibitorService.list();
        setExhibitors(res.exhibitors || []);
      } catch (err) {
        setError(err?.message || "Failed to load exhibitors.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const industries = useMemo(() => {
    const set = new Set(exhibitors.map((e) => e.industry).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [exhibitors]);

  const filtered = useMemo(() => {
    let list = [...exhibitors];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.companyName?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      );
    }
    if (industryFilter !== "all") list = list.filter((e) => e.industry === industryFilter);
    return list;
  }, [exhibitors, search, industryFilter]);

  if (loading) return <div className="exsearch-page"><div className="exsearch-loading"><RefreshCw className="att-spin" /> Loading exhibitors...</div></div>;
  if (error) return <div className="exsearch-page"><div className="exsearch-error"><AlertCircle /> {error}</div></div>;

  return (
    <div className="exsearch-page">
      <header className="exsearch-header">
        <div>
          <h1>Exhibitor Search</h1>
          <p>Find companies, products, and services at the expo.</p>
        </div>
        <div className="exsearch-count"><strong>{filtered.length}</strong> companies</div>
      </header>

      <section className="exsearch-toolbar">
        <div className="exsearch-input-wrap">
          <Search size={16} />
          <input type="text" placeholder="Search by company name or description..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="exsearch-filter">
          <Filter size={14} />
          <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
            {industries.map((i) => <option key={i} value={i}>{i === "all" ? "All Industries" : i}</option>)}
          </select>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="exsearch-empty">
          <Building2 size={48} />
          <h3>No exhibitors found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="exsearch-grid">
          {filtered.map((ex) => {
            const logoInitial = ex.companyName ? ex.companyName.charAt(0).toUpperCase() : "C";
            const id = ex._id || ex.id;
            return (
              <div key={id} className="exsearch-card" onClick={() => navigate(`/attendee/exhibitors/${id}`)}>
                <div className="exsearch-card__banner"></div>
                <div className="exsearch-card__content">
                  <div className="exsearch-card__avatar">
                    {ex.logo ? <img src={ex.logo} alt={ex.companyName} /> : logoInitial}
                  </div>
                  <h3 className="exsearch-card__title">{ex.companyName || "Unknown Company"}</h3>
                  <div className="exsearch-card__tags">
                    {ex.industry && <span className="exsearch-tag">{ex.industry}</span>}
                    {ex.city && <span className="exsearch-tag exsearch-tag--loc"><MapPin size={10} /> {ex.city}</span>}
                  </div>
                  <p className="exsearch-card__desc">
                    {ex.description || "No description provided."}
                  </p>
                  <div className="exsearch-card__actions">
                    <button className="exsearch-btn">View Profile</button>
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