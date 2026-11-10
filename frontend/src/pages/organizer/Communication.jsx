import { useState, useEffect, useMemo, useRef } from "react";
import messageService from "../../services/messageService";
import "./Communication.css";

function relativeTime(iso) {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.floor((now - t) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDay(iso) {
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}
function initials(name = "U") {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function Communication() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const threadRef = useRef(null);

  useEffect(() => { loadConversations(); }, []);

  async function loadConversations() {
    setLoading(true);
    try {
      const res = await messageService.getAllConversations();
      setConversations(res.conversations || []);
    } catch (err) {
      showToast("error", "Failed to load conversations.");
    } finally { setLoading(false); }
  }

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = useMemo(() => {
    let list = [...conversations];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => (c.exhibitor?.name || "").toLowerCase().includes(q) || (c.subject || "").toLowerCase().includes(q));
    }
    return list;
  }, [conversations, search]);

  const active = activeId ? conversations.find((c) => (c._id || c.id) === activeId) : null;

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [activeId, active?.messages.length]);

  const openConversation = (conv) => { setActiveId(conv._id || conv.id); setReplyText(""); };
  const backToList = () => { setActiveId(null); };

  const sendReply = async () => {
    const text = replyText.trim();
    if (!text || !activeId) return;
    setSending(true);
    try {
      const res = await messageService.adminReply(activeId, text);
      setConversations((prev) => prev.map((c) => ((c._id || c.id) === activeId ? res.conversation : c)));
      setReplyText("");
      showToast("success", "Reply sent.");
    } catch (err) {
      showToast("error", "Failed to send reply.");
    } finally { setSending(false); }
  };

  const openCount = conversations.filter((c) => c.status === "open" || c.status === "in_progress").length;

  return (
    <div className="comms">
      <div className="org-page-header">
        <div className="org-page-header__titles">
          <h1 className="org-page-header__title">Communication</h1>
          <p className="org-page-header__subtitle">Reply to exhibitor inquiries, track open conversations, and resolve threads.</p>
        </div>
        <div className="org-page-header__actions">
          <span className="org-badge org-badge--info">{openCount} open</span>
        </div>
      </div>

      <div className="comms-layout">
        <aside className="comms-list">
          <div className="comms-list__head">
            <input type="search" className="org-input" placeholder="Search by exhibitor or subject…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="comms-list__body">
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="comms-list__empty"><p>No conversations found.</p></div>
            ) : (
              filtered.map((c) => {
                const convId = c._id || c.id;
                const last = c.messages[c.messages.length - 1];
                const exName = c.exhibitor?.name || "Unknown Exhibitor";
                return (
                  <button key={convId} type="button" className={`comms-item ${activeId === convId ? "comms-item--active" : ""}`} onClick={() => openConversation(c)}>
                    <div className="comms-item__avatar">{initials(exName)}</div>
                    <div className="comms-item__main">
                      <div className="comms-item__top">
                        <span className="comms-item__company">{exName}</span>
                        <span className="comms-item__time">{relativeTime(c.updatedAt)}</span>
                      </div>
                      <div className="comms-item__subject">{c.subject}</div>
                      <div className="comms-item__preview">{last?.body?.slice(0, 60)}{last?.body?.length > 60 ? "…" : ""}</div>
                      <div className="comms-item__meta">
                        <span className={`org-badge ${c.status === "resolved" ? "org-badge--success" : "org-badge--info"}`} style={{ fontSize: 9, padding: "1px 6px", textTransform: "capitalize" }}>
                          {c.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="comms-thread">
          {!active ? (
            <div className="comms-thread__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <p className="comms-thread__empty-title">Select a conversation</p>
              <p className="comms-thread__empty-desc">Choose a thread on the left to view messages and reply.</p>
            </div>
          ) : (
            <>
              <header className="comms-thread__head">
                <div className="comms-thread__head-main">
                  <h2>{active.subject}</h2>
                  <p>{active.exhibitor?.name} · {active.category}</p>
                </div>
              </header>
              <div className="comms-thread__messages" ref={threadRef}>
                {active.messages.map((m, idx) => {
                  const prev = active.messages[idx - 1];
                  const showDay = !prev || formatDay(prev.at) !== formatDay(m.at);
                  return (
                    <div key={m._id || idx}>
                      {showDay && <div className="comms-thread__day"><span>{formatDay(m.at)}</span></div>}
                      <div className={`comms-msg comms-msg--${m.from === "organizer" ? "admin" : m.from}`}>
                        <div className="comms-msg__bubble">{m.body}</div>
                        <div className="comms-msg__time">{formatTime(m.at)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <footer className="comms-thread__composer">
                <div className="comms-thread__composer-row">
                  <textarea className="org-textarea comms-thread__input" rows={2} placeholder="Write a reply…" value={replyText} onChange={(e) => setReplyText(e.target.value)} disabled={sending} />
                  <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={sendReply} disabled={!replyText.trim() || sending}>
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
      {toast && <div className={`expo-toast expo-toast--${toast.type}`} role="status">{toast.text}</div>}
    </div>
  );
}