import "./SessionCard.css";

export default function SessionCard({ session, onEdit, onDelete }) {
  return (
    <div className="session-card">
      <div className="session-card__time">
        <span className="session-card__start">{session.startTime}</span>
        <span className="session-card__end">{session.endTime}</span>
      </div>
      
      <div className="session-card__content">
        <div className="session-card__header">
          <h4 className="session-card__title">{session.title}</h4>
          <span className={`badge-type badge-type--${session.type.toLowerCase()}`}>
            {session.type}
          </span>
        </div>
        
        <div className="session-card__meta">
          <span>🎤 {session.speaker}</span>
          <span>📍 {session.room}</span>
        </div>
        <p className="session-card__desc">{session.description}</p>
      </div>

      <div className="session-card__actions">
        <button type="button" className="btn-action btn-edit" onClick={() => onEdit(session)}>Edit</button>
        <button type="button" className="btn-action btn-delete" onClick={() => onDelete(session)}>Delete</button>
      </div>
    </div>
  );
}