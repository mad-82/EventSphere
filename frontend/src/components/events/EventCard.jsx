import { Link } from "react-router-dom";
import "./EventCard.css";

export default function EventCard({ expo }) {
  return (
    <div className="card h-100 shadow-sm event-card">
      <div className="event-card__img-wrap">
        {expo.cover ? (
          <img src={expo.cover} alt={expo.title} className="card-img-top event-card__img" />
        ) : (
          <div className="event-card__img-placeholder d-flex align-items-center justify-content-center bg-secondary text-white">
            <h4>No Image</h4>
          </div>
        )}
        <span className="badge bg-dark event-card__badge">{expo.category}</span>
      </div>

      <div className="card-body">
        <h4 className="card-title fw-bold">{expo.title}</h4>
        <p className="text-muted small mb-3">
          <i className="bi bi-calendar-event"></i> {expo.startDate} to {expo.endDate}
        </p>
        <p className="card-text text-truncate">{expo.description}</p>
        <p className="mb-1 text-muted small">
          <i className="bi bi-geo-alt-fill"></i> {expo.location} · {expo.venue}
        </p>
      </div>

      <div className="card-footer bg-white border-0 pt-0 pb-3 d-flex gap-2">
        <Link to={`/events/${expo.id}`} className="btn btn-outline-dark w-50 fw-bold">
          Details
        </Link>
        <Link to={`/ticket/${expo.id}`} className="btn btn-dark w-50 fw-bold">
          Get Ticket
        </Link>
      </div>
    </div>
  );
}