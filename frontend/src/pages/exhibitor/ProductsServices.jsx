import { useState, useEffect, useMemo } from "react";
import { Package, Plus, Trash2, Edit, Tag, DollarSign, X, Search, Layers, Wrench } from "lucide-react";
import productService from "../../services/productService";
import "./ProductsServices.css";

export default function ProductsServices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  
  const [form, setForm] = useState({
    name: "",
    kind: "Product",
    category: "",
    price: "",
    description: "",
  });

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await productService.getMyProducts();
      setItems(res.products || []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    products: items.filter((i) => i.kind === "Product").length,
    services: items.filter((i) => i.kind === "Service").length,
  }), [items]);

  // Filter + Search
  const filteredItems = useMemo(() => {
    let list = [...items];
    if (filterType !== "All") list = list.filter((i) => i.kind === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    return list;
  }, [items, filterType, search]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) await productService.update(editingId, form);
      else await productService.create(form);
      await fetchProducts();
      closeModal();
    } catch (err) { alert("Failed to save."); } 
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await productService.remove(id);
      await fetchProducts();
    } catch (err) { alert("Failed to delete."); }
  };

  const openEdit = (item) => {
    setEditingId(item._id || item.id);
    setForm({ ...item });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ name: "", kind: "Product", category: "", price: "", description: "" });
  };

  if (loading) return <div className="products-page"><div className="ps-loading">Loading catalogue...</div></div>;

  return (
    <div className="products-page">
      <header className="products-header">
        <div>
          <h1>Products & Services</h1>
          <p>Showcase your catalogue to attendees and organizers.</p>
        </div>
        <button className="ps-btn ps-btn--primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add New
        </button>
      </header>

      {/* Stats */}
      <div className="ps-stats">
        <div className="ps-stat-card">
          <div className="ps-stat-card__icon"><Layers size={20} /></div>
          <div className="ps-stat-card__info"><span>Total Items</span><strong>{stats.total}</strong></div>
        </div>
        <div className="ps-stat-card">
          <div className="ps-stat-card__icon ps-stat-card__icon--product"><Package size={20} /></div>
          <div className="ps-stat-card__info"><span>Products</span><strong>{stats.products}</strong></div>
        </div>
        <div className="ps-stat-card">
          <div className="ps-stat-card__icon ps-stat-card__icon--service"><Wrench size={20} /></div>
          <div className="ps-stat-card__info"><span>Services</span><strong>{stats.services}</strong></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="ps-toolbar">
        <div className="ps-search">
          <Search size={16} />
          <input type="text" placeholder="Search by name or category..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="ps-tabs">
          {["All", "Product", "Service"].map((t) => (
            <button key={t} className={`ps-tab ${filterType === t ? "is-active" : ""}`} onClick={() => setFilterType(t)}>{t}s</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="ps-empty">
          <Package size={48} />
          <h3>No items found</h3>
          <p>Try adjusting your filters or add a new item.</p>
        </div>
      ) : (
        <div className="ps-grid">
          {filteredItems.map((item, index) => {
            const itemId = item._id || item.id || index;
            return (
              <div key={itemId} className="ps-card">
                <div className="ps-card__top">
                  <span className={`ps-badge ps-badge--${item.kind.toLowerCase()}`}>{item.kind}</span>
                  <div className="ps-card__actions">
                    <button onClick={() => openEdit(item)} className="icon-btn"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(itemId)} className="icon-btn icon-btn--danger"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3 className="ps-card__title">{item.name}</h3>
                <p className="ps-card__desc">{item.description}</p>
                <div className="ps-card__footer">
                  <div className="ps-card__meta"><Tag size={13} /> {item.category}</div>
                  {item.price && <div className="ps-card__price"><DollarSign size={13} /> {item.price}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="ps-modal-backdrop" onClick={closeModal}>
          <div className="ps-modal" onClick={(e) => e.stopPropagation()}>
            <header className="ps-modal__head">
              <h2>{editingId ? "Edit Item" : "Add New Item"}</h2>
              <button onClick={closeModal} className="ps-modal__close"><X size={20} /></button>
            </header>
            <form onSubmit={handleSave} className="ps-form">
              <div className="ps-form__group">
                <label>Name</label>
                <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. IoT Gateway X7" />
              </div>
              <div className="ps-form__row">
                <div className="ps-form__group">
                  <label>Type</label>
                  <select value={form.kind} onChange={(e) => setForm({...form, kind: e.target.value})}>
                    <option value="Product">Product</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
                <div className="ps-form__group">
                  <label>Category</label>
                  <input required value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} placeholder="e.g. Hardware" />
                </div>
              </div>
              <div className="ps-form__group">
                <label>Price (Optional)</label>
                <input value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} placeholder="e.g. PKR 50,000" />
              </div>
              <div className="ps-form__group">
                <label>Description</label>
                <textarea required rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Describe the item briefly..." />
              </div>
              <div className="ps-form__actions">
                <button type="button" className="ps-btn ps-btn--ghost" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="ps-btn ps-btn--primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}