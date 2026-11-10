import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./BoothSelection.css";

import FloorPlan from "../../components/booths/FloorPlan";
import BoothCard from "../../components/booths/BoothCard";
import BoothDetails from "../../components/booths/BoothDetails";
import boothService from "../../services/boothService";

const PAGE_SIZE = 9; // Ek page par 9 cards

export default function BoothSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Floor Map ke liye alag state
  const [mapActiveHall, setMapActiveHall] = useState("All");
  const [mapStatusFilter, setMapStatusFilter] = useState("All");

  // Cards & Filters ke liye state
  const [activeHall, setActiveHall] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("number");
  const [page, setPage] = useState(1);
  const [selectedBoothId, setSelectedBoothId] = useState(null);

  useEffect(() => {
    boothService.list()
      .then(res => {
        setBooths(res.booths || []);
      })
      .catch(err => {
        console.error("API Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter logic (Cards)
  let filteredBooths = [...booths];
  if (activeHall !== "All") {
    filteredBooths = filteredBooths.filter(b => b.hall === activeHall);
  }
  if (search) {
    filteredBooths = filteredBooths.filter(b => 
      b.boothNumber.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Sorting
  filteredBooths.sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return a.boothNumber.localeCompare(b.boothNumber);
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredBooths.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedBooths = filteredBooths.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Floor Map booths (sirf hall filter)
  let mapBooths = [...booths];
  if (mapActiveHall !== "All") {
    mapBooths = mapBooths.filter(b => b.hall === mapActiveHall);
  }

  const floorPlanBooths = mapBooths.map(b => ({
    ...b,
    id: b.id || b._id,
    number: b.boothNumber,
    status: b.status === "Booked" ? "Occupied" : b.status
  }));

  const handleBookBooth = async (boothId) => {
    if (!user) return navigate("/login", { state: { from: "/booths" } });
    if (user.role !== "exhibitor") return alert("Only exhibitors can book booths.");

    try {
      await boothService.reserve(boothId);
      alert("Booth Reserved Successfully!");
      setSelectedBoothId(null);
      const res = await boothService.list();
      setBooths(res.booths || []);
    } catch (err) {
      alert(err.message || "Failed to reserve booth.");
    }
  };

  const selectedBooth = booths.find(b => (b.id || b._id) === selectedBoothId);

  // Halls list
  const uniqueHalls = [...new Set(booths.map(b => b.hall).filter(Boolean))];

  if (loading) return <div className="text-center py-5 text-white"><h3>Loading Booths...</h3></div>;

  return (
    <div className="booth-page-wrapper">
      <div className="booth-hero">
        <div className="container text-center">
          <span className="booth-hero__badge">Exhibition Floor Plan</span>
          <h1 className="booth-hero__title">Explore Exhibition Booths</h1>
          <p className="booth-hero__subtitle">
            Find the perfect space for your brand and reserve it instantly.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: "-30px", position: "relative", zIndex: 10 }}>
        
        {/* ✅ Stats (Black Cards) */}
        <div className="row text-center mb-4 animated-section">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 py-3">
              <h6 className="text-muted">Total Booths</h6>
              <h2 className="fw-bold text-white">{booths.length}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 py-3">
              <h6 className="text-muted">Showing (After Filter)</h6>
              <h2 className="fw-bold text-success">{filteredBooths.length}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 py-3">
              <h6 className="text-muted">Active Hall</h6>
              <h2 className="fw-bold text-primary">{activeHall}</h2>
            </div>
          </div>
        </div>

        {/* ✅ Floor Map with Animation */}
        <div className="mb-5 animated-section">
          <h3 className="mb-3 fw-bold text-white">Interactive Floor Map</h3>
          {mapBooths.length > 0 ? (
            <FloorPlan 
              halls={mapActiveHall === "All" ? uniqueHalls : [mapActiveHall]}
              activeHall={mapActiveHall === "All" ? uniqueHalls[0] : mapActiveHall}
              onHallChange={(h) => setMapActiveHall(h)}
              booths={floorPlanBooths}
              selectedBoothId={selectedBoothId}
              onBoothSelect={(id) => setSelectedBoothId(id)}
              statusFilter={mapStatusFilter}
              onStatusFilterChange={setMapStatusFilter}
              showLegend={true}
            />
          ) : (
            <div className="alert alert-warning">No booths available in this hall.</div>
          )}
        </div>

        {/* ✅ Filters with Animation */}
        <div className="animated-section mb-4">
          <h4 className="mb-3 fw-bold text-white">Filter Booths</h4>
          <div className="row g-3">
            <div className="col-md-4">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search by Booth Number..." 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
              />
            </div>
            <div className="col-md-4">
              <select 
                className="form-select" 
                value={activeHall}
                onChange={(e) => { setActiveHall(e.target.value); setPage(1); }}
              >
                <option value="All">All Halls / Floors</option>
                {uniqueHalls.map(hall => (
                  <option key={hall} value={hall}>{hall}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" onChange={(e) => setSortBy(e.target.value)}>
                <option value="number">Sort: Booth No.</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* ✅ Booth Cards (Square + Hover Animation) */}
        <div className="mb-5">
          <h3 className="mb-3 fw-bold text-white">Booth Directory</h3>
          {filteredBooths.length === 0 ? (
            <div className="alert alert-danger">
              <strong>No booths found!</strong> Try changing the filters above.
            </div>
          ) : (
            <>
              <div className="row g-4">
                {pagedBooths.map((booth) => (
                  <div className="col-md-4 col-lg-4" key={booth.id || booth._id}>
                    {/* ✅ Wrapper for Square Shape & Hover */}
                    <div 
                      className="booth-card-wrapper" 
                      onClick={() => setSelectedBoothId(booth.id || booth._id)}
                    >
                      <BoothCard booth={booth} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <span style={{ color: "#A7B0C0" }}>
                    Showing <strong className="text-white">{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredBooths.length)}</strong> of <strong className="text-white">{filteredBooths.length}</strong> booths
                  </span>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-light"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                    >
                      ← Prev
                    </button>
                    <span className="align-self-center px-2 text-white">Page {safePage} of {totalPages}</span>
                    <button 
                      className="btn btn-outline-light"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedBooth && (
        <BoothDetails 
          booth={selectedBooth} 
          onClose={() => setSelectedBoothId(null)} 
          onBook={handleBookBooth}
        />
      )}
    </div>
  );
}