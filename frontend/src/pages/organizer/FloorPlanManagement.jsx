import { useState, useEffect, useMemo, useCallback } from "react";
import FloorPlan from "../../components/booths/FloorPlan";
import boothService from "../../services/boothService";
import eventService from "../../services/eventService";
import "./FloorPlanManagement.css";

const SIZE_OPTIONS = ["6×6 m²", "9×9 m²", "12×12 m²", "15×15 m²"];

const EMPTY_FORM = {
  expoId: "",
  number: "",
  hall: "",
  floor: "Ground Floor",
  size: "9×9 m²",
  price: "",
  status: "Available",
};

export default function FloorPlanManagement() {
  const [expos, setExpos] = useState([]);
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferredHall, setPreferredHall] = useState("");
  const [selectedBoothId, setSelectedBoothId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [modalMode, setModalMode] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);

  /* Toast auto-hide */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  /* Load expos + all booths on mount */
  useEffect(() => {
    let active = true;

    Promise.all([
      eventService.list({ limit: 100 }).catch(() => ({ expos: [] })),
      boothService.list({}).catch(() => ({ booths: [] })),
    ])
      .then(([expoRes, boothRes]) => {
        if (!active) return;
        const expoList = expoRes.expos || expoRes.data || [];
        const boothList = boothRes.booths || [];
        setExpos(expoList);
        setBooths(boothList);
      })
      .catch((err) => console.error("Load error:", err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  /* Reload all booths */
  const fetchBooths = useCallback(async () => {
    try {
      const res = await boothService.list({});
      setBooths(res.booths || []);
    } catch (err) {
      console.error("Booths load error:", err);
      setToast({ type: "error", text: "Failed to load booths." });
    }
  }, []);

  /* Halls across ALL booths */
  const halls = useMemo(() => {
    return Array.from(new Set(booths.map((b) => b.hall).filter(Boolean)));
  }, [booths]);

  /* Derived active hall */
  const activeHall = halls.includes(preferredHall)
    ? preferredHall
    : halls[0] || "";
  const setActiveHall = (h) => setPreferredHall(h);

  /* Booths for active hall */
  const hallBooths = useMemo(
    () => booths.filter((b) => b.hall === activeHall),
    [booths, activeHall]
  );

  // ✅ Safe ID check for selected booth
  const selectedBooth = selectedBoothId
    ? booths.find((b) => (b.id || b._id) === selectedBoothId)
    : null;

  const exhibitorName = (booth) =>
    booth.reservedBy?.companyName || booth.reservedBy?.name || null;

  /* Stats across ALL booths */
  const stats = useMemo(() => {
    const total = booths.length;
    const occupied = booths.filter(
      (b) => b.status === "Occupied" || b.status === "Booked"
    ).length;
    const reserved = booths.filter((b) => b.status === "Reserved").length;
    const available = booths.filter((b) => b.status === "Available").length;
    const pct = total === 0 ? 0 : Math.round((occupied / total) * 100);
    return { total, occupied, reserved, available, pct };
  }, [booths]);

  /* ---------- Actions ---------- */

  const openCreate = () => {
    setModalMode("create");
    setForm({
      ...EMPTY_FORM,
      hall: activeHall || "",
      expoId: expos[0]?.id || expos[0]?._id || "",
    });
    setFormErrors({});
  };

  const openEdit = (booth) => {
    setModalMode("edit");
    setForm({
      number: booth.boothNumber,
      hall: booth.hall,
      floor: booth.floor || "Ground Floor",
      size: booth.size,
      price: String(booth.price),
      status: booth.status,
      expoId: booth.expoId || "",
    });
    setFormErrors({});
  };

  const closeModal = () => {
    setModalMode(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const validateForm = () => {
    const errs = {};
    if (modalMode === "create" && !form.expoId) {
      errs.expoId = "Please select an event.";
    }
    if (!form.number.trim()) errs.number = "Booth number is required.";
    if (!form.hall.trim()) errs.hall = "Hall is required.";
    if (!form.floor.trim()) errs.floor = "Floor is required.";
    if (!form.price || Number(form.price) <= 0)
      errs.price = "Price must be greater than 0.";

    // Duplicate check scoped by expo
    if (form.expoId) {
      const dup = booths.find(
        (b) =>
          String(b.expoId?._id || b.expoId) === String(form.expoId) &&
          b.boothNumber.trim().toLowerCase() ===
            form.number.trim().toLowerCase() &&
          (b.id || b._id) !== selectedBooth?.id
      );
      if (dup) errs.number = "This booth number already exists in that event.";
    }
    return errs;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    try {
      if (modalMode === "create") {
        await boothService.create({
          expoId: form.expoId,
          boothNumber: form.number.trim(),
          hall: form.hall.trim(),
          floor: form.floor.trim(),
          size: form.size,
          price: Number(form.price),
          status: form.status,
        });
        setToast({ type: "success", text: `Booth ${form.number} created.` });
      } else if (modalMode === "edit" && selectedBooth) {
        await boothService.update(selectedBooth.id || selectedBooth._id, {
          boothNumber: form.number.trim(),
          hall: form.hall.trim(),
          floor: form.floor.trim(),
          size: form.size,
          price: Number(form.price),
          status: selectedBooth.reservedBy ? "Occupied" : form.status,
        });
        setToast({ type: "success", text: `Booth ${form.number} updated.` });
      }

      await fetchBooths();
      setActiveHall(form.hall.trim());
      closeModal();
    } catch (err) {
      setToast({
        type: "error",
        text: err.response?.data?.message || err.message || "Save failed.",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedBooth) return;
    if (selectedBooth.reservedBy) {
      setToast({
        type: "error",
        text: "Cannot delete an occupied booth. Unassign first.",
      });
      return;
    }
    try {
      await boothService.remove(selectedBooth.id || selectedBooth._id);
      setToast({
        type: "success",
        text: `Booth ${selectedBooth.boothNumber} deleted.`,
      });
      setSelectedBoothId(null);
      await fetchBooths();
    } catch (err) {
      setToast({
        type: "error",
        text: err.response?.data?.message || err.message,
      });
    }
  };

  /* Drag to reposition */
  const handleMoveBooth = (boothId, gridPosition) => {
    const moving = booths.find((b) => (b.id || b._id) === boothId);
    if (!moving) return;

    const occupant = booths.find(
      (b) =>
        (b.id || b._id) !== boothId &&
        String(b.expoId?._id || b.expoId) === String(moving.expoId?._id || moving.expoId) &&
        b.gridPosition &&
        b.gridPosition.col !== null &&
        b.gridPosition.row !== null &&
        b.gridPosition.col === gridPosition.col &&
        b.gridPosition.row === gridPosition.row
    );
    if (occupant) {
      setToast({
        type: "error",
        text: `Cell occupied by booth ${occupant.boothNumber}.`,
      });
      return;
    }
    
    // UI Update
    setBooths((list) =>
      list.map((b) => ((b.id || b._id) === boothId ? { ...b, gridPosition } : b))
    );
    setHasUnsavedChanges(true);
  };

  /* Save floor plan — group positions by expo */
  const handleSaveLayout = async () => {
    try {
      const byExpo = {};
      booths.forEach((b) => {
        if (
          b.gridPosition &&
          b.gridPosition.col !== null &&
          b.gridPosition.row !== null
        ) {
          const expId = b.expoId?._id || b.expoId;
          if (!byExpo[expId]) byExpo[expId] = [];
          byExpo[expId].push({
            boothId: b.id || b._id,
            col: b.gridPosition.col,
            row: b.gridPosition.row,
          });
        }
      });

      // Save each expo's positions
      await Promise.all(
        Object.entries(byExpo).map(([expId, positions]) =>
          boothService.saveFloorPlan(expId, positions)
        )
      );

      setHasUnsavedChanges(false);
      setToast({ type: "success", text: "Floor plan saved." });
    } catch (err) {
      setToast({
        type: "error",
        text: err.response?.data?.message || err.message,
      });
    }
  };

  const handleDiscardChanges = () => {
    fetchBooths();
    setSelectedBoothId(null);
    setHasUnsavedChanges(false);
    setToast({ type: "success", text: "Changes discarded." });
  };

  /* ---------- Render ---------- */
  if (loading)
    return (
      <div className="org-page">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="floor-plan-page">
      <div className="org-page-header">
        <div className="org-page-header__titles">
          <h1 className="org-page-header__title">Floor Plan Management</h1>
          <p className="org-page-header__subtitle">
            All booths across all events. Drag booths to reposition them.
          </p>
        </div>
        <div className="org-page-header__actions">
          {hasUnsavedChanges && (
            <>
              <button
                type="button"
                className="org-btn org-btn--secondary org-btn--sm"
                onClick={handleDiscardChanges}
              >
                Discard
              </button>
              <button
                type="button"
                className="org-btn org-btn--primary org-btn--sm"
                onClick={handleSaveLayout}
              >
                Save Changes
              </button>
            </>
          )}
          <button
            type="button"
            className="org-btn org-btn--primary org-btn--sm"
            onClick={openCreate}
          >
            + Create Booth
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="fpm-stats">
        <div className="org-card fpm-stat">
          <span className="fpm-stat__label">Total</span>
          <span className="fpm-stat__value">{stats.total}</span>
        </div>
        <div className="org-card fpm-stat fpm-stat--available">
          <span className="fpm-stat__label">Available</span>
          <span className="fpm-stat__value">{stats.available}</span>
        </div>
        <div className="org-card fpm-stat fpm-stat--reserved">
          <span className="fpm-stat__label">Reserved</span>
          <span className="fpm-stat__value">{stats.reserved}</span>
        </div>
        <div className="org-card fpm-stat fpm-stat--occupied">
          <span className="fpm-stat__label">Occupied</span>
          <span className="fpm-stat__value">{stats.occupied}</span>
        </div>
        <div className="org-card fpm-stat fpm-stat--pct">
          <span className="fpm-stat__label">Occupancy</span>
          <span className="fpm-stat__value">{stats.pct}%</span>
          <div className="fpm-stat__bar">
            <div
              className="fpm-stat__bar-fill"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="fpm-layout">
        <div className="fpm-canvas org-card">
          {halls.length === 0 ? (
            <div className="org-empty">
              <p className="org-empty__title">No booths created yet</p>
              <p className="org-empty__desc">
                Create your first booth to start building the floor plan.
              </p>
              <button
                type="button"
                className="org-btn org-btn--primary org-btn--sm"
                onClick={openCreate}
              >
                + Create Booth
              </button>
            </div>
          ) : (
            <FloorPlan
              halls={halls}
              activeHall={activeHall}
              onHallChange={(h) => {
                setActiveHall(h);
                setSelectedBoothId(null);
              }}
              // ✅ Yahan ID aur GridPosition handle kiya hai
              booths={hallBooths.map((b) => ({
                ...b,
                id: b.id || b._id,
                gridPosition: b.gridPosition || null,
                number: b.boothNumber,
                status: b.status === "Booked" ? "Occupied" : b.status,
                exhibitorName: exhibitorName(b),
              }))}
              selectedBoothId={selectedBoothId}
              onBoothSelect={(id) =>
                setSelectedBoothId(id === selectedBoothId ? null : id)
              }
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              showLegend
              onBoothMove={handleMoveBooth}
            />
          )}
        </div>

        <aside className="fpm-panel org-card">
          {!selectedBooth ? (
            <div className="fpm-panel__empty">
              <p className="fpm-panel__empty-title">Select a booth</p>
              <p className="fpm-panel__empty-desc">
                Click any booth on the floor plan to manage its details.
              </p>
            </div>
          ) : (
            <>
              <header className="fpm-panel__head">
                <div>
                  <h2 className="fpm-panel__title">
                    Booth {selectedBooth.boothNumber}
                  </h2>
                  <p className="fpm-panel__sub">
                    {selectedBooth.hall} · {selectedBooth.floor}
                  </p>
                </div>
                <span
                  className={`org-badge ${
                    selectedBooth.status === "Occupied"
                      ? "org-badge--success"
                      : selectedBooth.status === "Reserved"
                      ? "org-badge--warning"
                      : "org-badge--info"
                  }`}
                >
                  {selectedBooth.status}
                </span>
              </header>

              <dl className="fpm-panel__kv">
                <div>
                  <dt>Size</dt>
                  <dd>{selectedBooth.size}</dd>
                </div>
                <div>
                  <dt>Price</dt>
                  <dd>
                    PKR {Number(selectedBooth.price).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt>Exhibitor</dt>
                  <dd>{exhibitorName(selectedBooth) || "—"}</dd>
                </div>
                <div>
                  <dt>Event</dt>
                  <dd>
                    {expos.find((e) => (e.id || e._id) === (selectedBooth.expoId?._id || selectedBooth.expoId))?.title || "—"}
                  </dd>
                </div>
              </dl>

              <div className="fpm-panel__actions">
                <button
                  type="button"
                  className="org-btn org-btn--secondary org-btn--sm"
                  onClick={() => openEdit(selectedBooth)}
                >
                  Edit Booth
                </button>
                <button
                  type="button"
                  className="org-btn org-btn--danger org-btn--sm"
                  onClick={handleDelete}
                  disabled={Boolean(selectedBooth.reservedBy)}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Create/Edit modal */}
      {modalMode && (
        <div className="fpm-modal-backdrop" onClick={closeModal}>
          <div
            className="fpm-modal org-card"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="fpm-modal__head">
              <h2>{modalMode === "create" ? "Create Booth" : "Edit Booth"}</h2>
              <button
                type="button"
                className="fpm-modal__close"
                onClick={closeModal}
              >
                ×
              </button>
            </header>

            <form className="fpm-form" onSubmit={handleSave} noValidate>
              {modalMode === "create" && (
                <div className="fpm-form__field fpm-form__field--full">
                  <label>Event *</label>
                  <select
                    className="org-select"
                    value={form.expoId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, expoId: e.target.value }))
                    }
                  >
                    <option value="">— Select an event —</option>
                    {expos.map((x) => (
                      <option key={x.id || x._id} value={x.id || x._id}>
                        {x.title || x.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.expoId && (
                    <span className="fpm-form__error">
                      {formErrors.expoId}
                    </span>
                  )}
                </div>
              )}

              <div className="fpm-form__grid">
                <div className="fpm-form__field">
                  <label>Booth Number *</label>
                  <input
                    className="org-input"
                    value={form.number}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, number: e.target.value }))
                    }
                    placeholder="e.g. A-106"
                  />
                  {formErrors.number && (
                    <span className="fpm-form__error">
                      {formErrors.number}
                    </span>
                  )}
                </div>
                <div className="fpm-form__field">
                  <label>Hall *</label>
                  <input
                    className="org-input"
                    value={form.hall}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, hall: e.target.value }))
                    }
                    placeholder="e.g. Hall A"
                    list="fpm-hall-options"
                  />
                  <datalist id="fpm-hall-options">
                    {halls.map((h) => (
                      <option key={h} value={h} />
                    ))}
                  </datalist>
                  {formErrors.hall && (
                    <span className="fpm-form__error">{formErrors.hall}</span>
                  )}
                </div>
                <div className="fpm-form__field">
                  <label>Floor *</label>
                  <input
                    className="org-input"
                    value={form.floor}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, floor: e.target.value }))
                    }
                    placeholder="e.g. Ground Floor"
                  />
                  {formErrors.floor && (
                    <span className="fpm-form__error">{formErrors.floor}</span>
                  )}
                </div>
                <div className="fpm-form__field">
                  <label>Size</label>
                  <select
                    className="org-select"
                    value={form.size}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, size: e.target.value }))
                    }
                  >
                    {SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="fpm-form__field">
                  <label>Price (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    className="org-input"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="4500"
                  />
                  {formErrors.price && (
                    <span className="fpm-form__error">{formErrors.price}</span>
                  )}
                </div>
                <div className="fpm-form__field">
                  <label>Status</label>
                  <select
                    className="org-select"
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    disabled={Boolean(selectedBooth?.reservedBy)}
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    {selectedBooth?.reservedBy && (
                      <option value="Occupied">Occupied</option>
                    )}
                  </select>
                </div>
              </div>

              <footer className="fpm-form__actions">
                <button
                  type="button"
                  className="org-btn org-btn--secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="org-btn org-btn--primary">
                  {modalMode === "create" ? "Create Booth" : "Save Changes"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`expo-toast expo-toast--${toast.type}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}