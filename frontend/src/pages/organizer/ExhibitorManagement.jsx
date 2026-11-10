import { useState, useEffect, useMemo } from "react";
import exhibitorService from "../../services/exhibitorService";
import "./ExhibitorManagement.css";

const INDUSTRIES = [
  "Technology", "F&B", "Packaging", "Textiles", "Logistics",
  "Pharma", "Automotive", "Manufacturing", "Education", "Finance", "Other",
];

const STATUS_OPTIONS = ["All", "Approved", "Pending", "Rejected"];

const STATUS_BADGE = {
  Approved: "org-badge org-badge--success",
  Pending:  "org-badge org-badge--warning",
  Rejected: "org-badge org-badge--danger",
};

const PAGE_SIZE = 6;

/* Helper: company initials avatar ke liye */
function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/* Helper: consistent gradient by name (har company ka apna color) */
function getAvatarGradient(name = "") {
  const palettes = [
    "linear-gradient(135deg, #97BFD9 0%, #6FA8CB 100%)",
    "linear-gradient(135deg, #6FA8CB 0%, #4A7C9B 100%)",
    "linear-gradient(135deg, #B5D7EA 0%, #97BFD9 100%)",
    "linear-gradient(135deg, #97BFD9 0%, #4A7C9B 100%)",
    "linear-gradient(135deg, #6FA8CB 0%, #B5D7EA 100%)",
    "linear-gradient(135deg, #4A7C9B 0%, #6FA8CB 100%)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return palettes[hash % palettes.length];
}

export default function ExhibitorManagement() {
  const [exhibitors, setExhibitors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(null);
  const [toast, setToast] = useState(null);

  /* Fetch exhibitors */
  useEffect(() => {
    fetchExhibitors();
  }, []);

  async function fetchExhibitors() {
    setLoading(true);
    try {
      const res = await exhibitorService.getAllExhibitors();
      setExhibitors(res.exhibitors || []);
    } catch (err) {
      setToast({ type: "error", text: "Failed to load exhibitors." });
    } finally {
      setLoading(false);
    }
  }

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  /* Filter */
  const filtered = useMemo(() => {
    let list = [...exhibitors];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          (e.companyName || "").toLowerCase().includes(q) ||
          (e.user?.name || "").toLowerCase().includes(q) ||
          (e.user?.email || "").toLowerCase().includes(q)
      );
    }
    if (industryFilter !== "All") {
      list = list.filter((e) => e.industry === industryFilter);
    }
    return list;
  }, [exhibitors, search, industryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const detail = detailId
    ? exhibitors.find((e) => (e._id || e.id) === detailId)
    : null;

  const handleExportCsv = () => {
    const csv = [
      ["Company", "Contact", "Email", "Industry", "City", "Verified"],
      ...filtered.map((e) => [
        e.companyName || "",
        e.user?.name || "",
        e.user?.email || "",
        e.industry || "",
        e.city || "",
        e.user?.isVerifiedExhibitor ? "Yes" : "No",
      ]),
    ]
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exhibitors.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast({
      type: "success",
      text: `Exported ${filtered.length} exhibitor(s).`,
    });
  };

  return (
    <div className="exhibitors">
      {/* Page header */}
      <div className="org-page-header">
        <div className="org-page-header__titles">
          <h1 className="org-page-header__title">Exhibitor Management</h1>
          <p className="org-page-header__subtitle">
            Browse all registered exhibitors, view their submitted details, and access booth allocations.
          </p>
        </div>
        <div className="org-page-header__actions">
          <button
            type="button"
            className="org-btn org-btn--secondary org-btn--sm"
            onClick={handleExportCsv}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="exhibitors-filters org-card">
        <input
          type="search"
          className="org-input"
          placeholder="Search by company, contact or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="org-select"
          value={industryFilter}
          onChange={(e) => {
            setIndustryFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All industries</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      {/* Table / states */}
      {loading ? (
        <div className="org-empty org-card">Loading exhibitors...</div>
      ) : paged.length === 0 ? (
        <div className="exhibitors-empty org-card">
          <div className="exhibitors-empty__icon">🏢</div>
          <p className="exhibitors-empty__title">No exhibitors found</p>
          <p className="exhibitors-empty__desc">
            No exhibitors have registered yet.
          </p>
        </div>
      ) : (
        <div className="exhibitors-table-wrap org-card">
          <table className="exhibitors-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Industry</th>
                <th>City</th>
                <th>Status</th>
                <th>Registered</th>
                <th style={{ width: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((e, index) => {
                const rowId = e._id || e.id || index;
                const companyName = e.companyName || "Unknown Company";
                const verified = e.user?.isVerifiedExhibitor;

                return (
                  <tr key={rowId}>
                    {/* Company cell with avatar */}
                    <td>
                      <div className="exhibitors-company">
                        <div
                          className="exhibitors-company__avatar"
                          style={{ background: getAvatarGradient(companyName) }}
                        >
                          {getInitials(companyName)}
                        </div>
                        <div className="exhibitors-company__text">
                          <span className="exhibitors-company__name">
                            {companyName}
                          </span>
                          <span className="exhibitors-company__email">
                            {e.user?.email || "—"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td>
                      <div className="exhibitors-contact">
                        <span className="exhibitors-contact__name">
                          {e.user?.name || "—"}
                        </span>
                        <span className="exhibitors-contact__phone">
                          {e.user?.phone || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Industry */}
                    <td>{e.industry || "—"}</td>

                    {/* City */}
                    <td>{e.city || "—"}</td>

                    {/* Verified badge */}
                    <td>
                      <span
                        className={`org-badge ${
                          verified
                            ? "org-badge--success"
                            : "org-badge--warning"
                        }`}
                      >
                        {verified ? "Verified" : "Pending"}
                      </span>
                    </td>

                    {/* Registered date */}
                    <td>
                      {e.createdAt
                        ? new Date(e.createdAt).toLocaleDateString()
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="exhibitors-actions">
                        <button
                          type="button"
                          className="org-btn org-btn--ghost org-btn--sm"
                          onClick={() => setDetailId(rowId)}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="exhibitors-pagination">
          <span className="exhibitors-pagination__info">
            Page {safePage} of {totalPages} · {filtered.length} total
          </span>
          <div className="exhibitors-pagination__controls">
            <button
              className="org-btn org-btn--secondary org-btn--sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              ← Prev
            </button>
            <button
              className="org-btn org-btn--secondary org-btn--sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div
          className="exhibitors-modal-backdrop"
          onClick={() => setDetailId(null)}
        >
          <div
            className="exhibitors-modal"
            onClick={(ev) => ev.stopPropagation()}
          >
            <header className="exhibitors-modal__head">
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  className="exhibitors-company__avatar"
                  style={{
                    background: getAvatarGradient(detail.companyName || ""),
                    width: 44,
                    height: 44,
                    fontSize: 15,
                  }}
                >
                  {getInitials(detail.companyName || "")}
                </div>
                <div>
                  <h2>{detail.companyName || "Unknown Company"}</h2>
                  <p className="exhibitors-modal__sub">
                    {detail.industry || "—"} · {detail.city || "—"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="exhibitors-modal__close"
                onClick={() => setDetailId(null)}
              >
                ×
              </button>
            </header>

            <div className="exhibitors-modal__meta">
              <span
                className={`org-badge ${
                  detail.user?.isVerifiedExhibitor
                    ? "org-badge--success"
                    : "org-badge--warning"
                }`}
              >
                {detail.user?.isVerifiedExhibitor
                  ? "Verified"
                  : "Pending Verification"}
              </span>
            </div>

            <section className="exhibitors-modal__section">
              <h3>Company Details</h3>
              <div className="exhibitors-kv">
                <div>
                  <span>Website</span>
                  {detail.website ? (
                    <a
                      href={detail.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {detail.website}
                    </a>
                  ) : (
                    <span>—</span>
                  )}
                </div>
                <div>
                  <span>Registration No.</span>
                  <span>{detail.registrationNumber || "—"}</span>
                </div>
                <div>
                  <span>Category</span>
                  <span>{detail.category || "—"}</span>
                </div>
              </div>
              <p className="exhibitors-modal__desc" style={{ marginTop: 12 }}>
                {detail.description || "No description provided."}
              </p>
            </section>

            <section className="exhibitors-modal__section">
              <h3>Primary Contact</h3>
              <div className="exhibitors-kv">
                <div>
                  <span>Name</span>
                  <span>{detail.user?.name || "—"}</span>
                </div>
                <div>
                  <span>Email</span>
                  <a href={`mailto:${detail.user?.email}`}>
                    {detail.user?.email || "—"}
                  </a>
                </div>
                <div>
                  <span>Phone</span>
                  <span>{detail.phone || detail.user?.phone || "—"}</span>
                </div>
              </div>
            </section>

            <footer className="exhibitors-modal__actions">
              <button
                type="button"
                className="org-btn org-btn--secondary"
                onClick={() => setDetailId(null)}
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`expo-toast expo-toast--${toast.type}`}
          role="status"
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}