import React from "react";
import "./BoothDetails.css";

export default function BoothDetails({ booth, onClose, onBook }) {
  if (!booth) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0">
          
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title">Booth Details: {booth.boothNumber}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <div className="modal-body p-4">
            <div className="row">
              <div className="col-md-6 mb-3">
                <h6 className="text-muted text-uppercase mb-3">Location & Size</h6>
                <p className="mb-1"><strong>Floor:</strong> {booth.floor}</p>
                <p className="mb-1"><strong>Hall / Section:</strong> {booth.hall}</p>
                <p className="mb-1"><strong>Location:</strong> {booth.locationDetails || "N/A"}</p>
                <p className="mb-1"><strong>Size:</strong> {booth.size}</p>
                <p className="mb-1"><strong>Total Area:</strong> {booth.totalArea}</p>
                <p className="mb-1"><strong>Capacity:</strong> {booth.capacity}</p>
              </div>
              
              <div className="col-md-6 mb-3">
                <h6 className="text-muted text-uppercase mb-3">Pricing & Status</h6>
                <p className="mb-1"><strong>Type:</strong> {booth.type}</p>
                <h4 className="text-primary my-2">PKR {booth.price?.toLocaleString()}</h4>
                <p className="mb-1">
                  <strong>Availability:</strong>{" "}
                  <span className={`badge ${booth.status === 'Available' ? 'bg-success' : 'bg-danger'}`}>
                    {booth.status}
                  </span>
                </p>
              </div>

              <div className="col-12 mt-2">
                <h6 className="text-muted text-uppercase mb-2">Facilities Included</h6>
                <div className="d-flex flex-wrap gap-2">
                  {booth.facilities && booth.facilities.length > 0 ? (
                    booth.facilities.map((fac, i) => (
                      <span key={i} className="badge bg-light text-dark border">{fac}</span>
                    ))
                  ) : (
                    <span className="text-muted small">Standard facilities apply</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            {booth.status === "Available" && (
              <button type="button" className="btn btn-success px-4" onClick={() => onBook(booth.id)}>
                Select Booth
              </button>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}