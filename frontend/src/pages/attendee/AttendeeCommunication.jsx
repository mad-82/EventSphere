import { useState, useEffect, useRef } from "react";
import { Send, Plus, MessageSquare, Clock, CheckCircle2, X, Search, RefreshCw } from "lucide-react";
import messageService from "../../services/messageService";
import "./AttendeeCommunication.css";

const fmtTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
};

export default function AttendeeCommunication() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [reply, setReply] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "General Inquiry", message: "" });
  
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

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
    (c.subject || "").toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Message is "mine" if sent by attendee OR legacy exhibitor
  const isMyMessage = (from) => from === "attendee" || from === "exhibitor";

  return (
    <div className="attcomm-page">
      {/* Sidebar */}
      <aside className="attcomm-sidebar">
        <div className="attcomm-sidebar__header">
          <h2>Messages</h2>
          <button className="attcomm-btn attcomm-btn--primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New
          </button>
        </div>

        <div className="attcomm-search">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="attcomm-list">
          {loading ? (
            <div className="attcomm-loading">
              <RefreshCw className="att-spin" size={16} /> Loading...
            </div>
          ) : filteredConvs.length === 0 ? (
            <p className="attcomm-list__empty">No inquiries found.</p>
          ) : (
            filteredConvs.map((c) => {
              const convId = c._id || c.id;
              const lastMsg = c.messages && c.messages[c.messages.length - 1];
              return (
                <button
                  key={convId}
                  className={`attcomm-list-item ${activeId === convId ? "is-active" : ""}`}
                  onClick={() => setActiveId(convId)}
                >
                  <div className="attcomm-list-item__top">
                    <span className="attcomm-list-item__subject">{c.subject}</span>
                    {c.status === "resolved" && <CheckCircle2 size={14} style={{ color: "#16a34a" }} />}
                  </div>
                  <span className="attcomm-list-item__meta">
                    {c.category} · {fmtDate(c.createdAt)}
                  </span>
                  <span className="attcomm-list-item__preview">
                    {lastMsg?.body || ""}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="attcomm-main">
        {!activeConv ? (
          <div className="attcomm-main__empty">
            <MessageSquare size={48} />
            <h3>Select a conversation</h3>
            <p>Choose an inquiry from the left or start a new one.</p>
          </div>
        ) : (
          <>
            <header className="attcomm-main__header">
              <div>
                <h3>{activeConv.subject}</h3>
                <span className="attcomm-main__meta">
                  <Clock size={12} /> {activeConv.category} · Status: <strong>{activeConv.status?.replace("_", " ")}</strong>
                </span>
              </div>
            </header>

            <div className="attcomm-messages">
              {activeConv.messages?.map((m, i) => (
                <div key={i} className={`attcomm-bubble-row ${isMyMessage(m.from) ? "is-mine" : "is-theirs"}`}>
                  <div className="attcomm-bubble">
                    <p>{m.body}</p>
                    <span className="attcomm-bubble__time">{fmtTime(m.at)}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="attcomm-composer" onSubmit={handleSendReply}>
              <input
                type="text"
                placeholder="Type your reply here..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                disabled={sending}
              />
              <button type="submit" className="attcomm-send-btn" disabled={!reply.trim() || sending}>
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </main>

      {/* New Inquiry Modal */}
      {showModal && (
        <div className="attcomm-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="attcomm-modal" onClick={(e) => e.stopPropagation()}>
            <header className="attcomm-modal__head">
              <h2>New Inquiry</h2>
              <button onClick={() => setShowModal(false)} className="attcomm-modal__close"><X size={20} /></button>
            </header>
            <form onSubmit={handleCreateInquiry} className="attcomm-form">
              <div className="attcomm-form__group">
                <label>Subject</label>
                <input
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="What is your question about?"
                />
              </div>
              <div className="attcomm-form__group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option>General Inquiry</option>
                  <option>Event</option>
                  <option>Booth</option>
                  <option>Technical Support</option>
                </select>
              </div>
              <div className="attcomm-form__group">
                <label>Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your question in detail..."
                />
              </div>
              <div className="attcomm-form__actions">
                <button type="button" className="attcomm-btn attcomm-btn--ghost" onClick={() => setShowModal(false)} disabled={sending}>
                  Cancel
                </button>
                <button type="submit" className="attcomm-btn attcomm-btn--primary" disabled={sending}>
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