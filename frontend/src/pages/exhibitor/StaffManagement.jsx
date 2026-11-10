import { useState, useEffect, useMemo } from "react";
import { UserPlus, Mail, Phone, Trash2, Edit, X, Users, Search, Shield } from "lucide-react";
import staffService from "../../services/staffService";
import "./StaffManagement.css";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  
  const [form, setForm] = useState({
    name: "",
    designation: "",
    role: "Sales Lead",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    setLoading(true);
    try {
      const res = await staffService.getMyStaff();
      setStaff(res.staff || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Stats calculate karo
  const stats = useMemo(() => {
    const roles = {};
    staff.forEach((s) => {
      roles[s.role] = (roles[s.role] || 0) + 1;
    });
    return { total: staff.length, roles };
  }, [staff]);

  // Search filter
  const filteredStaff = useMemo(() => {
    if (!search.trim()) return staff;
    const q = search.toLowerCase();
    return staff.filter(
      (s) => s.name.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [staff, search]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await staffService.update(editingId, form);
      } else {
        await staffService.create(form);
      }
      await fetchStaff();
      closeModal();
    } catch (err) {
      alert("Failed to save staff member.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this staff member?")) return;
    try {
      await staffService.remove(id);
      await fetchStaff();
    } catch (err) {
      alert("Failed to delete staff.");
    }
  };

  const openEdit = (member) => {
    setEditingId(member._id || member.id);
    setForm({ ...member });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ name: "", designation: "", role: "Sales Lead", email: "", phone: "" });
  };

  if (loading) return <div className="staff-page"><div className="staff-loading">Loading team...</div></div>;

  return (
    <div className="staff-page">
      <header className="staff-header">
        <div>
          <h1>Staff Management</h1>
          <p>Manage your team members representing the company at expos.</p>
        </div>
        <button className="staff-btn staff-btn--primary" onClick={() => setShowModal(true)}>
          <UserPlus size={16} /> Add Member
        </button>
      </header>

      {/* Premium Stats Row */}
      <div className="staff-stats">
        <div className="staff-stat-card">
          <div className="staff-stat-card__icon"><Users size={20} /></div>
          <div className="staff-stat-card__info">
            <span>Total Team</span>
            <strong>{stats.total}</strong>
          </div>
        </div>
        {Object.entries(stats.roles).slice(0, 3).map(([role, count]) => (
          <div key={role} className="staff-stat-card">
            <div className="staff-stat-card__icon"><Shield size={20} /></div>
            <div className="staff-stat-card__info">
              <span>{role}</span>
              <strong>{count}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="staff-toolbar">
        <div className="staff-search">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by name, role or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Premium List View */}
      {filteredStaff.length === 0 ? (
        <div className="staff-empty">
          <Users size={48} />
          <h3>No team members found</h3>
          <p>Add your team members to get started.</p>
        </div>
      ) : (
        <div className="staff-list">
          {filteredStaff.map((member, index) => {
            const memberId = member._id || member.id || index;
            return (
              <div key={memberId} className="staff-list-item">
                <div className="staff-list-item__avatar">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="staff-list-item__main">
                  <h3>{member.name}</h3>
                  <p>{member.designation}</p>
                </div>

                <div className="staff-list-item__role">
                  <span className="staff-badge">{member.role}</span>
                </div>

                <div className="staff-list-item__contact">
                  <div><Mail size={14} /> {member.email}</div>
                  <div><Phone size={14} /> {member.phone}</div>
                </div>

                <div className="staff-list-item__actions">
                  <button onClick={() => openEdit(member)} className="icon-btn" title="Edit">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(memberId)} className="icon-btn icon-btn--danger" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal (Same as before) */}
      {showModal && (
        <div className="staff-modal-backdrop" onClick={closeModal}>
          <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
            <header className="staff-modal__head">
              <h2>{editingId ? "Edit Staff Member" : "Add Staff Member"}</h2>
              <button onClick={closeModal} className="staff-modal__close"><X size={20} /></button>
            </header>
            <form onSubmit={handleSave} className="staff-form">
              <div className="staff-form__group">
                <label>Full Name</label>
                <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. Ayesha Siddiqui" />
              </div>
              <div className="staff-form__row">
                <div className="staff-form__group">
                  <label>Designation</label>
                  <input required value={form.designation} onChange={(e) => setForm({...form, designation: e.target.value})} placeholder="e.g. Head of Sales" />
                </div>
                <div className="staff-form__group">
                  <label>Role</label>
                  <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
                    <option value="Sales Lead">Sales Lead</option>
                    <option value="Technical">Technical</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Manager">Manager</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
              </div>
              <div className="staff-form__group">
                <label>Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="email@company.com" />
              </div>
              <div className="staff-form__group">
                <label>Phone</label>
                <input required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="+92 300 1234567" />
              </div>
              <div className="staff-form__actions">
                <button type="button" className="staff-btn staff-btn--ghost" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="staff-btn staff-btn--primary" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}