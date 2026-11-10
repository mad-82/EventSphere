import { MapPin, Users, Maximize } from "lucide-react";
import "./BoothCard.css";

export default function BoothCard({ booth, onClick }) {
  const getImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"; // Fallback Image
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="booth-card-premium" onClick={onClick}>
      <div className="booth-card-premium__img-wrap">
        <img src={getImageUrl(booth.image)} alt={booth.boothNumber} />
        <span className={`booth-card-premium__status booth-card-premium__status--${booth.status?.toLowerCase()}`}>
          {booth.status}
        </span>
      </div>
      
      <div className="booth-card-premium__content">
        <h3 className="booth-card-premium__title">{booth.boothNumber}</h3>
        <p className="booth-card-premium__location"><MapPin size={12} /> {booth.hall}</p>
        
        <div className="booth-card-premium__meta">
          <span><Maximize size={12} /> {booth.size}</span>
          <span><Users size={12} /> {booth.capacity || "Any"}</span>
        </div>

        <div className="booth-card-premium__price">
          <span>Starting from</span>
          <strong>PKR {booth.price?.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}