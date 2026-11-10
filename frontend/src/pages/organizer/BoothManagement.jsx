import { useState, useEffect } from "react";
import "./BoothManagement.css";
import boothService from "../../services/boothService";
import eventService from "../../services/eventService";

export default function BoothManagement() {
  const [booths, setBooths] = useState([]);
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [modalMode, setModalMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    expoId: "",
    boothNumber: "",
    floor: "Ground Floor",
    hall: "Main Hall",
    size: "3m x 3m",
    totalArea: "",
    capacity: "",
    type: "Standard",
    price: "",
    status: "Available",
    facilities: "",
    locationDetails: "",
    image: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [boothRes, expoRes] = await Promise.all([
        boothService.list(),
        eventService.list()
      ]);
      // ✅ Booth data check (id ya _id)
      setBooths(boothRes.booths || []);
      setExpos(expoRes.expos || []);
    } catch (err) {
      showToast("error", "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setForm({
      expoId: expos.length > 0 ? (expos[0].id || expos[0]._id) : "",
      boothNumber: "",
      floor: "Ground Floor",
      hall: "Main Hall",
      size: "3m x 3m",
      totalArea: "",
      capacity: "",
      type: "Standard",
      price: "",
      status: "Available",
      facilities: "",
      locationDetails: "",
      image: "",
    });
    setFormErrors({});
  };

  const openEdit = (booth) => {
    setModalMode("edit");
    // ✅ ID safe karein
    setEditingId(booth.id || booth._id);
    
    setForm({
      expoId: typeof booth.expoId === 'object' ? (booth.expoId.id || booth.expoId._id) : booth.expoId,
      boothNumber: booth.boothNumber,
      floor: booth.floor,
      hall: booth.hall,
      size: booth.size,
      totalArea: booth.totalArea || "",
      capacity: booth.capacity || "",
      type: booth.type || "Standard",
      price: booth.price.toString(),
      status: booth.status,
      facilities: booth.facilities ? booth.facilities.join(", ") : "",
      locationDetails: booth.locationDetails || "",
      image: booth.image || "",
    });
    setFormErrors({});
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: undefined });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.expoId) errs.expoId = "Expo is required";
    if (!form.boothNumber.trim()) errs.boothNumber = "Booth Number is required";
    if (!form.price || Number(form.price) <= 0) errs.price = "Valid price is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      facilities: form.facilities.split(",").map(f => f.trim()).filter(Boolean)
    };

    try {
      if (modalMode === "create") {
        await boothService.create(payload);
        showToast("success", "Booth created successfully.");
      } else {
        await boothService.update(editingId, payload);
        showToast("success", "Booth updated successfully.");
      }
      closeModal();
      loadData();
    } catch (err) {
      showToast("error", err.message || "Failed to save booth.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ DELETE FUNCTION FIX
  const handleDelete = async (id) => {
    if (!id) {
      alert("Error: Booth ID is missing. Cannot delete.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this booth?")) return;
    
    try {
      await boothService.remove(id);
      showToast("success", "Booth deleted.");
      loadData();
    } catch (err) {
      showToast("error", err.message || "Failed to delete booth.");
    }
  };

  return (
    <div className="booths">
      <div className="org-page-header">
        <div className="org-page-header__titles">
          <h1 className="org-page-header__title">Booth Management</h1>
          <p className="org-page-header__subtitle">Create and manage booths for your expos.</p>
        </div>
        <div className="org-page-header__actions">
          <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={openCreate}>
            + Create Booth
          </button>
        </div>
      </div>

      {loading ? (
        <div className="org-empty org-card">Loading...</div>
      ) : booths.length === 0 ? (
        <div className="org-empty org-card">No booths found. Create one!</div>
      ) : (
        <div className="booths-table-wrap org-card">
          <table className="booths-table">
            <thead>
              <tr>
                <th>Booth No</th>
                <th>Expo</th>
                <th>Location</th>
                <th>Size / Area</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {booths.map((b) => {
                const boothId = b.id || b._id; // ✅ ID extract
                const expoId = b.expoId?._id || b.expoId; // ✅ Handle populated expo

                return (
                  <tr key={boothId}>
                    <td><strong>{b.boothNumber}</strong></td>
                    <td>{expos.find(e => String(e.id || e._id) === String(expoId))?.title || "Unknown"}</td>
                    <td>{b.floor} · {b.hall}</td>
                    <td>{b.size} <br/><small className="text-muted">{b.totalArea}</small></td>
                    <td>{b.type}</td>
                    <td>PKR {b.price?.toLocaleString()}</td>
                    <td>
                      <span className={`org-badge ${b.status === 'Available' ? 'org-badge--success' : b.status === 'Reserved' ? 'org-badge--warning' : 'org-badge--danger'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div className="expo-actions">
                        <button type="button" className="org-btn org-btn--ghost org-btn--sm" onClick={() => openEdit(b)}>Edit</button>
                        {/* ✅ Yahan b._id pass kiya hai safely */}
                        <button type="button" className="org-btn org-btn--danger org-btn--sm" onClick={() => handleDelete(boothId)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalMode && (
        <div className="expo-modal-backdrop" onClick={closeModal}>
          <div className="expo-modal org-card" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <header className="expo-modal__head">
              <h2>{modalMode === "create" ? "Create Booth" : "Edit Booth"}</h2>
              <button type="button" className="expo-modal__close" onClick={closeModal}>×</button>
            </header>

            <form className="expo-form" onSubmit={handleSave}>
              <div className="expo-form__grid">
                <div className="expo-form__field expo-form__field--full">
                  <label>Select Expo *</label>
                  <select className="org-select" name="expoId" value={form.expoId} onChange={handleChange}>
                    <option value="">-- Select Expo --</option>
                    {expos.map(e => <option key={e.id || e._id} value={e.id || e._id}>{e.title}</option>)}
                  </select>
                  {formErrors.expoId && <span className="expo-form__error">{formErrors.expoId}</span>}
                </div>

                <div className="expo-form__field">
                  <label>Booth Number *</label>
                  <input className="org-input" name="boothNumber" value={form.boothNumber} onChange={handleChange} placeholder="e.g. A-101" />
                  {formErrors.boothNumber && <span className="expo-form__error">{formErrors.boothNumber}</span>}
                </div>
                <div className="expo-form__field">
                  <label>Price (PKR) *</label>
                  <input type="number" className="org-input" name="price" value={form.price} onChange={handleChange} placeholder="150000" />
                  {formErrors.price && <span className="expo-form__error">{formErrors.price}</span>}
                </div>

                <div className="expo-form__field">
                  <label>Floor</label>
                  <select className="org-select" name="floor" value={form.floor} onChange={handleChange}>
                    <option>Ground Floor</option>
                    <option>First Floor</option>
                    <option>Second Floor</option>
                  </select>
                </div>
                <div className="expo-form__field">
                  <label>Hall / Section</label>
                  <input className="org-input" name="hall" value={form.hall} onChange={handleChange} placeholder="e.g. Hall A" />
                </div>

                <div className="expo-form__field">
                  <label>Size</label>
                  <select className="org-select" name="size" value={form.size} onChange={handleChange}>
                    <option>3m x 3m</option>
                    <option>3m x 6m</option>
                    <option>6m x 6m</option>
                    <option>Custom Size</option>
                  </select>
                </div>
                <div className="expo-form__field">
                  <label>Total Area</label>
                  <input className="org-input" name="totalArea" value={form.totalArea} onChange={handleChange} placeholder="e.g. 9 sqm" />
                </div>

                <div className="expo-form__field">
                  <label>Capacity</label>
                  <input className="org-input" name="capacity" value={form.capacity} onChange={handleChange} placeholder="e.g. 4-6 people" />
                </div>
                <div className="expo-form__field">
                  <label>Booth Type</label>
                  <select className="org-select" name="type" value={form.type} onChange={handleChange}>
                    <option>Standard</option>
                    <option>Premium</option>
                    <option>Corner</option>
                    <option>Island</option>
                    <option>Shell Scheme</option>
                    <option>Raw Space</option>
                  </select>
                </div>

                <div className="expo-form__field">
                  <label>Status</label>
                  <select className="org-select" name="status" value={form.status} onChange={handleChange}>
                    <option>Available</option>
                    <option>Reserved</option>
                    <option>Booked</option>
                  </select>
                </div>
                <div className="expo-form__field">
                  <label>Location Details</label>
                  <input className="org-input" name="locationDetails" value={form.locationDetails} onChange={handleChange} placeholder="e.g. Near entrance" />
                </div>

                <div className="expo-form__field expo-form__field--full">
                  <label>Booth Image URL</label>
                  <input className="org-input" name="image" value={form.image} onChange={handleChange} placeholder="https://images.unsplash.com/..." />
                  <small className="text-muted">Provide a high-quality image for this booth. Leave empty to use default.</small>
                </div>

                <div className="expo-form__field expo-form__field--full">
                  <label>Facilities (Comma separated)</label>
                  <input className="org-input" name="facilities" value={form.facilities} onChange={handleChange} placeholder="e.g. Tables, Chairs, Electricity" />
                </div>
              </div>

              <footer className="expo-form__actions">
                <button type="button" className="org-btn org-btn--secondary" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="org-btn org-btn--primary" disabled={saving}>{saving ? "Saving..." : "Save Booth"}</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`expo-toast expo-toast--${toast.type}`}>{toast.text}</div>}
    </div>
  );
}