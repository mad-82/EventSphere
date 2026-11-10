import { useState, useEffect, useRef } from "react";
import { Send, Plus, MessageSquare, Clock, CheckCircle2, X, Search, RefreshCw } from "lucide-react";
import messageService from "../../services/messageService";
import "./ExhibitorCommunication.css";

const fmtTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

export default function ExhibitorCommunication() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [reply, setReply] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [form, setForm] = useState({ subject: "", category: "General Inquiry", message: "" });
  const messagesEndRef = useRef(null);

  // 1. Backend se conversations load karo
  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    setLoading(true);
    try {
      const res = await messageService.getMyConversations();
      setConversations(res.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const activeConv = conversations.find((c) => (c._id || c.id) === activeId);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  // 2. Nayi inquiry bhejo
  const handleCreateInquiry = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await messageService.create(form);
      setConversations([res.conversation, ...conversations]);
      setActiveId(res.conversation._id);
      setShowModal(false);
      setForm({ subject: "", category: "General Inquiry", message: "" });
    } catch (err) {
      alert("Failed to send inquiry.");
    } finally {
      setSending(false);
    }
  };

  // 3. Reply bhejo
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeId) return;
    
    setSending(true);
    try {
      const res = await messageService.reply(activeId, reply.trim());
      
      setConversations((prev) =>
        prev.map((c) => ((c._id || c.id) === activeId ? res.conversation : c))
      );
      setReply("");
    } catch (err) {
      alert("Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter((c) => 
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="comm-page">
      {/* Sidebar */}
      <aside className="comm-sidebar">
        <div className="comm-sidebar__header">
          <h2>Messages</h2>
          <button className="comm-btn comm-btn--primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New
          </button>
        </div>

        <div className="comm-search">
          <Search size={14} />
          <input type="text" placeholder="Search inquiries..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="comm-list">
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
              <RefreshCw className="exb-spin" /> Loading...
            </div>
          ) : filteredConvs.length === 0 ? (
            <p className="comm-list__empty">No inquiries found.</p>
          ) : (
            filteredConvs.map((c) => {
              const convId = c._id || c.id;
              return (
                <button
                  key={convId}
                  className={`comm-list-item ${activeId === convId ? "is-active" : ""}`}
                  onClick={() => setActiveId(convId)}
                >
                  <div className="comm-list-item__top">
                    <span className="comm-list-item__subject">{c.subject}</span>
                    {c.status === "resolved" && <CheckCircle2 size={14} className="text-success" />}
                  </div>
                  <span className="comm-list-item__meta">{c.category} · {fmtTime(c.createdAt)}</span>
                  <span className="comm-list-item__preview">
                    {c.messages[c.messages.length - 1]?.body}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="comm-main">
        {!activeConv ? (
          <div className="comm-main__empty">
            <MessageSquare size={48} />
            <h3>Select a conversation</h3>
            <p>Choose an inquiry from the left or start a new one.</p>
          </div>
        ) : (
          <>
            <header className="comm-main__header">
              <div>
                <h3>{activeConv.subject}</h3>
                <span className="comm-main__meta">
                  <Clock size={12} /> {activeConv.category} · Status: <strong>{activeConv.status.replace("_", " ")}</strong>
                </span>
              </div>
            </header>

            <div className="comm-messages">
              {activeConv.messages.map((m, i) => (
                <div key={i} className={`comm-bubble-row ${m.from === "exhibitor" ? "is-mine" : "is-theirs"}`}>
                  <div className="comm-bubble">
                    <p>{m.body}</p>
                    <span className="comm-bubble__time">{fmtTime(m.at)}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="comm-composer" onSubmit={handleSendReply}>
              <input
                type="text"
                placeholder="Type your reply here..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                disabled={sending}
              />
              <button type="submit" className="comm-send-btn" disabled={!reply.trim() || sending}>
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="comm-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="comm-modal" onClick={(e) => e.stopPropagation()}>
            <header className="comm-modal__head">
              <h2>New Inquiry</h2>
              <button onClick={() => setShowModal(false)} className="comm-modal__close"><X size={20} /></button>
            </header>
            <form onSubmit={handleCreateInquiry} className="comm-form">
              <div className="comm-form__group">
                <label>Subject</label>
                <input required value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} placeholder="What is your question about?" />
              </div>
              <div className="comm-form__group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                  <option>General Inquiry</option>
                  <option>Application</option>
                  <option>Booth</option>
                  <option>Payment</option>
                  <option>Technical Support</option>
                </select>
              </div>
              <div className="comm-form__group">
                <label>Message</label>
                <textarea required rows={4} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} placeholder="Describe your issue in detail..." />
              </div>
              <div className="comm-form__actions">
                <button type="button" className="comm-btn comm-btn--ghost" onClick={() => setShowModal(false)} disabled={sending}>Cancel</button>
                <button type="submit" className="comm-btn comm-btn--primary" disabled={sending}>
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}