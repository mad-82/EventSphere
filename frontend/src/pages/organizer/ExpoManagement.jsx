import { useState, useEffect, useMemo } from "react";
import "./ExpoManagement.css";
import eventService from "../../services/eventService";

const EMPTY_FORM = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
  venue: "",
  theme: "",
  category: "",
  cover: "",
  registrationStart: "",
  registrationEnd: "",
  maxAttendees: "",
  status: "Draft",
};

const STATUS_OPTIONS = ["Draft", "Published", "Archived"];
const CATEGORY_OPTIONS = [
  "Technology", "Packaging", "Automotive", "Pharma", "F&B",
  "Textiles", "Manufacturing", "Education", "Finance", "Other",
];

const STATUS_BADGE = {
  Published: "org-badge org-badge--success",
  Draft:     "org-badge org-badge--neutral",
  Archived:  "org-badge org-badge--info",
};

// ✅ 1. PAGE_SIZE 4 se badal kar 6 kar diya
const PAGE_SIZE = 6; 

function validateForm(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Event title is required.";
  if (!form.description.trim()) errors.description = "Description is required.";
  if (!form.startDate) errors.startDate = "Start date is required.";
  if (!form.endDate) errors.endDate = "End date is required.";
  if (form.startDate && form.endDate && form.endDate < form.startDate)
    errors.endDate = "End date must be on or after start date.";
  if (!form.location.trim()) errors.location = "Location is required.";
  if (!form.venue.trim()) errors.venue = "Venue is required.";
  if (!form.category) errors.category = "Category is required.";
  if (!form.registrationStart) errors.registrationStart = "Registration start is required.";
  if (!form.registrationEnd) errors.registrationEnd = "Registration end is required.";
  if (form.registrationStart && form.registrationEnd && form.registrationEnd < form.registrationStart)
    errors.registrationEnd = "Registration end must be after registration start.";
  if (!form.maxAttendees || Number(form.maxAttendees) <= 0)
    errors.maxAttendees = "Max attendees must be a positive number.";
  return errors;
}

export default function ExpoManagement() {
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All"); 
  const [sortBy, setSortBy] = useState("startDate");   
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const [modalMode, setModalMode] = useState(null); 
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExpos();
  }, []);

  async function loadExpos() {
    setLoading(true);
    try {
      const res = await eventService.list();
      setExpos(res.expos || []);
    } catch (err) {
      showToast("error", "Failed to load expos.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    let list = [...expos];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          (e.title || "").toLowerCase().includes(q) ||
          (e.location || "").toLowerCase().includes(q) ||
          (e.category || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") list = list.filter((e) => e.status === statusFilter);

    if (dateFilter === "Upcoming") list = list.filter((e) => e.startDate > today);
    else if (dateFilter === "Ongoing") list = list.filter((e) => e.startDate <= today && e.endDate >= today);
    else if (dateFilter === "Past") list = list.filter((e) => e.endDate < today);

    list.sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (sortBy === "startDate") { av = new Date(av).getTime(); bv = new Date(bv).getTime(); }
      if (sortBy === "attendees") { av = a.attendeeCount || 0; bv = b.attendeeCount || 0; }
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [expos, search, statusFilter, dateFilter, sortBy, sortDir, today]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const openEdit = (expo) => {
    setModalMode("edit");
    setEditingId(expo.id);
    setForm({
      title: expo.title,
      description: expo.description,
      startDate: expo.startDate,
      endDate: expo.endDate,
      location: expo.location,
      venue: expo.venue,
      theme: expo.theme || "",
      category: expo.category,
      cover: expo.cover || "",
      registrationStart: expo.registrationStart,
      registrationEnd: expo.registrationEnd,
      maxAttendees: String(expo.maxAttendees),
      status: expo.status,
    });
    setFormErrors({});
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const handleFieldChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFormErrors((errs) => {
      if (!errs[key]) return errs;
      const next = { ...errs };
      delete next[key];
      return next;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "create") {
        await eventService.create({ ...form, maxAttendees: Number(form.maxAttendees) });
        showToast("success", `"${form.title}" created successfully.`);
      } else if (modalMode === "edit" && editingId) {
        await eventService.update(editingId, { ...form, maxAttendees: Number(form.maxAttendees) });
        showToast("success", `"${form.title}" updated.`);
      }
      closeModal();
      loadExpos();
    } catch (err) {
      showToast("error", err.message || "Failed to save expo.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (expo) => {
    try {
      const res = await eventService.togglePublish(expo.id);
      showToast("success", `"${expo.title}" ${res.expo.status.toLowerCase()}.`);
      loadExpos();
    } catch (err) {
      showToast("error", err.message || "Failed to update status.");
    }
  };

  const requestDelete = (expo) => setConfirmDeleteId(expo.id);
  
  const confirmDelete = async () => {
    const target = expos.find((x) => x.id === confirmDeleteId);
    if (!target) return;
    try {
      await eventService.remove(confirmDeleteId);
      showToast("success", `"${target.title}" deleted.`);
      setConfirmDeleteId(null);
      loadExpos();
    } catch (err) {
      showToast("error", err.message || "Delete failed.");
    }
  };

  const handleExportCsv = () => {
    const csv = [
      ["Title", "Start", "End", "Location", "Category", "Status"],
      ...filtered.map((e) => [e.title, e.startDate, e.endDate, e.location, e.category, e.status]),
    ].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expos.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("success", `Exported ${filtered.length} expo(s).`);
  };

  return (
    <div className="expo">
      <div className="org-page-header">
        <div className="org-page-header__titles">
          <h1 className="org-page-header__title">Expo Management</h1>
          <p className="org-page-header__subtitle">
            Create, publish and manage all expos across the platform.
          </p>
        </div>
        <div className="org-page-header__actions">
          <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={handleExportCsv}>
            Export CSV
          </button>
          <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={openCreate}>
            + Create Expo
          </button>
        </div>
      </div>

      <div className="expo-filters org-card">
        <input type="search" className="org-input" placeholder="Search by title, location or category…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="org-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="All">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="org-select" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}>
          <option value="All">All dates</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Past">Past</option>
        </select>
        <select className="org-select" value={`${sortBy}:${sortDir}`} onChange={(e) => { const [k, d] = e.target.value.split(":"); setSortBy(k); setSortDir(d); }}>
          <option value="startDate:asc">Start date ↑</option>
          <option value="startDate:desc">Start date ↓</option>
          <option value="title:asc">Title A–Z</option>
          <option value="title:desc">Title Z–A</option>
        </select>
      </div>

      {loading ? (
        <div className="org-empty org-card">Loading expos from database...</div>
      ) : paged.length === 0 ? (
        <div className="org-empty org-card">
          <p className="org-empty__title">No expos found</p>
          <p className="org-empty__desc">Create your first expo to get started.</p>
          <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={openCreate}>
            + Create Expo
          </button>
        </div>
      ) : (
        <>
          <div className="expo-table-wrap org-card">
            <table className="expo-table">
              <thead>
                <tr>
                  <th style={{ width: 68 }}>Cover</th>
                  <th>Event</th>
                  <th>Dates</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className="expo-cover">
                        {e.cover ? (
                          <img src={e.cover} alt="" onError={(ev) => { ev.currentTarget.style.display = "none"; }} />
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="expo-title-cell">
                        <strong>{e.title}</strong>
                        <span className="expo-title-cell__theme">{e.theme || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="expo-dates">
                        <span>{e.startDate}</span>
                        <span>→ {e.endDate}</span>
                      </div>
                    </td>
                    <td>
                      <div className="expo-loc">
                        <span>{e.location}</span>
                        <span className="expo-loc__venue">{e.venue}</span>
                      </div>
                    </td>
                    <td>{e.category}</td>
                    <td><span className={STATUS_BADGE[e.status] || "org-badge"}>{e.status}</span></td>
                    <td>
                      <div className="expo-actions">
                        <button type="button" className="org-btn org-btn--ghost org-btn--sm" onClick={() => openEdit(e)}>Edit</button>
                        <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => togglePublish(e)}>
                          {e.status === "Published" ? "Unpublish" : "Publish"}
                        </button>
                        <button type="button" className="org-btn org-btn--danger org-btn--sm" onClick={() => requestDelete(e)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ 2. Pagination Buttons */}
          {totalPages > 1 && (
            <div className="expo-pagination" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
              <span style={{ fontSize: "14px", color: "#6B7280" }}>
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} expos
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="org-btn org-btn--secondary org-btn--sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  ← Prev
                </button>
                <span style={{ padding: "6px 12px", fontWeight: "bold", color: "white" }}>
                  Page {safePage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="org-btn org-btn--secondary org-btn--sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {modalMode && (
        <div className="expo-modal-backdrop" onClick={closeModal}>
          <div className="expo-modal org-card" onClick={(ev) => ev.stopPropagation()}>
            <header className="expo-modal__head">
              <h2>{modalMode === "create" ? "Create New Expo" : "Edit Expo"}</h2>
              <button type="button" className="expo-modal__close" onClick={closeModal}>×</button>
            </header>

            <form className="expo-form" onSubmit={handleSave} noValidate>
              <div className="expo-form__grid">
                <div className="expo-form__field expo-form__field--full">
                  <label>Event Title *</label>
                  <input className="org-input" value={form.title} onChange={handleFieldChange("title")} placeholder="e.g. TechWorld Expo 2026" />
                  {formErrors.title && <span className="expo-form__error">{formErrors.title}</span>}
                </div>

                <div className="expo-form__field expo-form__field--full">
                  <label>Description *</label>
                  <textarea className="org-textarea" rows={3} value={form.description} onChange={handleFieldChange("description")} />
                  {formErrors.description && <span className="expo-form__error">{formErrors.description}</span>}
                </div>

                <div className="expo-form__field">
                  <label>Start Date *</label>
                  <input type="date" className="org-input" value={form.startDate} onChange={handleFieldChange("startDate")} />
                  {formErrors.startDate && <span className="expo-form__error">{formErrors.startDate}</span>}
                </div>
                <div className="expo-form__field">
                  <label>End Date *</label>
                  <input type="date" className="org-input" value={form.endDate} onChange={handleFieldChange("endDate")} />
                  {formErrors.endDate && <span className="expo-form__error">{formErrors.endDate}</span>}
                </div>

                <div className="expo-form__field">
                  <label>Location *</label>
                  <input className="org-input" value={form.location} onChange={handleFieldChange("location")} />
                  {formErrors.location && <span className="expo-form__error">{formErrors.location}</span>}
                </div>
                <div className="expo-form__field">
                  <label>Venue *</label>
                  <input className="org-input" value={form.venue} onChange={handleFieldChange("venue")} />
                  {formErrors.venue && <span className="expo-form__error">{formErrors.venue}</span>}
                </div>

                <div className="expo-form__field">
                  <label>Theme</label>
                  <input className="org-input" value={form.theme} onChange={handleFieldChange("theme")} placeholder="e.g. Innovation & AI" />
                </div>
                <div className="expo-form__field">
                  <label>Category *</label>
                  <select className="org-select" value={form.category} onChange={handleFieldChange("category")}>
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {formErrors.category && <span className="expo-form__error">{formErrors.category}</span>}
                </div>

                <div className="expo-form__field expo-form__field--full">
                  <label>Cover Image URL</label>
                  <input className="org-input" value={form.cover} onChange={handleFieldChange("cover")} placeholder="https://images.unsplash.com/photo-..." />
                </div>

                <div className="expo-form__field">
                  <label>Max Attendees *</label>
                  <input type="number" className="org-input" value={form.maxAttendees} onChange={handleFieldChange("maxAttendees")} />
                  {formErrors.maxAttendees && <span className="expo-form__error">{formErrors.maxAttendees}</span>}
                </div>
                <div className="expo-form__field">
                  <label>Reg. Start *</label>
                  <input type="date" className="org-input" value={form.registrationStart} onChange={handleFieldChange("registrationStart")} />
                  {formErrors.registrationStart && <span className="expo-form__error">{formErrors.registrationStart}</span>}
                </div>
                <div className="expo-form__field">
                  <label>Reg. End *</label>
                  <input type="date" className="org-input" value={form.registrationEnd} onChange={handleFieldChange("registrationEnd")} />
                  {formErrors.registrationEnd && <span className="expo-form__error">{formErrors.registrationEnd}</span>}
                </div>
                
                <div className="expo-form__field">
                  <label>Status</label>
                  <select className="org-select" value={form.status} onChange={handleFieldChange("status")}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <footer className="expo-form__actions">
                <button type="button" className="org-btn org-btn--secondary" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="org-btn org-btn--primary" disabled={saving}>
                  {saving ? "Saving..." : (modalMode === "create" ? "Create Expo" : "Save Changes")}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="expo-modal-backdrop" onClick={() => setConfirmDeleteId(null)}>
          <div className="expo-modal org-card" onClick={(ev) => ev.stopPropagation()}>
            <h2>Delete expo?</h2>
            <p>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button className="org-btn org-btn--secondary" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              <button className="org-btn org-btn--danger" onClick={confirmDelete}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`expo-toast expo-toast--${toast.type}`}>{toast.text}</div>}
    </div>
  );
}