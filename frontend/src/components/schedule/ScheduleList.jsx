import "./ScheduleList.css";
import SessionCard from "./SessionCard";

export default function ScheduleList({ sessions, onEdit, onDelete, expoName }) {
  // Sessions ko date ke hisaab se group karein
  const grouped = {};
  sessions.forEach(s => {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  });

  const dates = Object.keys(grouped).sort();

  return (
    <div className="schedule-list-container">
      {dates.map(date => (
        <div key={date} className="schedule-date-group">
          <h3 className="schedule-date-title">
            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            <span className="schedule-date-count">{grouped[date].length} Sessions</span>
          </h3>
          
          <div className="schedule-date-sessions">
            {grouped[date].map(session => (
              <SessionCard 
                key={session.id} 
                session={{...session, expoName: expoName(session.expoId)}} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}