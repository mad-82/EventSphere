import { useMemo, useState } from "react";
import "./FloorPlan.css";

/* ============================================================
   FloorPlan — pure visual presentation component.

   Props
   -----
   halls:         string[]         — list of hall names to show tabs for.
   activeHall:    string           — currently active hall.
   onHallChange:  (hall) => void   — called when user clicks a hall tab.

   booths:        Booth[]          — booths for the active hall only.
   selectedBoothId: string | null
   onBoothSelect:   (id) => void

   statusFilter:    "All" | "Available" | "Reserved" | "Occupied"
   onStatusFilterChange?: (status) => void

   showLegend?:   boolean          — default true.
   onBoothMove?:  (id, {col,row}) => void
   ============================================================ */

const STATUS_COLORS = {
  Available: {
    bg: "rgba(151,191,217,0.15)",
    border: "#97BFD9",
    text: "#97BFD9",
  },
  Reserved: {
    bg: "rgba(251,191,36,0.15)",
    border: "#FBBF24",
    text: "#FBBF24",
  },
  Occupied: {
    bg: "rgba(52,211,153,0.15)",
    border: "#34D399",
    text: "#34D399",
  },
};

const COLS = 8;
const ROWS = 6;
// Row index that is rendered as the aisle divider
const AISLE_ROW = 3;

export default function FloorPlan({
  halls = [],
  activeHall,
  onHallChange,
  booths = [],
  selectedBoothId,
  onBoothSelect,
  statusFilter = "All",
  onStatusFilterChange,
  showLegend = true,
  onBoothMove,
}) {
  const [dragId, setDragId] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);

  /* Normalize booths: ensure every booth has a valid, unique gridPosition.
     - Booths with a valid position keep it.
     - Booths with null/undefined/missing position get auto-placed into the
       first free slot (so the layout always renders). */
  const positionedBooths = useMemo(() => {
    const slots = [];
    for (let r = 0; r < ROWS; r++) {
      if (r === AISLE_ROW) continue;
      for (let c = 0; c < COLS; c++) slots.push({ col: c, row: r });
    }

    const taken = new Set();
    const result = [];

    // First pass: booths with valid positions
    for (const b of booths) {
      const gp = b.gridPosition;
      const valid =
        gp &&
        Number.isInteger(gp.col) &&
        Number.isInteger(gp.row) &&
        gp.col >= 0 &&
        gp.col < COLS &&
        gp.row >= 0 &&
        gp.row < ROWS &&
        gp.row !== AISLE_ROW;
      if (valid) {
        const key = `${gp.col}-${gp.row}`;
        if (!taken.has(key)) {
          taken.add(key);
          result.push(b);
          continue;
        }
      }
      // Defer to second pass
      result.push({ ...b, __needsSlot: true });
    }

    // Second pass: auto-assign free slots
    let slotIdx = 0;
    const withPos = result.map((b) => {
      if (!b.__needsSlot) return b;
      while (
        slotIdx < slots.length &&
        taken.has(`${slots[slotIdx].col}-${slots[slotIdx].row}`)
      ) {
        slotIdx++;
      }
      const slot =
        slots[slotIdx] || { col: COLS - 1, row: ROWS - 1 };
      taken.add(`${slot.col}-${slot.row}`);
      slotIdx++;
      const { __needsSlot, ...rest } = b;
      return { ...rest, gridPosition: slot };
    });

    return withPos;
  }, [booths]);

  /* Filter for display */
  const visibleBooths = useMemo(() => {
    if (statusFilter === "All") return positionedBooths;
    return positionedBooths.filter((b) => b.status === statusFilter);
  }, [positionedBooths, statusFilter]);

  /* Occupancy lookup for quick cell queries */
  const occupiedCells = useMemo(() => {
    const m = new Map();
    positionedBooths.forEach((b) => {
      if (b.gridPosition) {
        m.set(`${b.gridPosition.col}-${b.gridPosition.row}`, b.id);
      }
    });
    return m;
  }, [positionedBooths]);

  /* Drag handlers */
  const handleDragStart = (e, id) => {
    if (!onBoothMove) return;
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e, cell) => {
    if (!onBoothMove || !dragId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCell(cell);
  };

  const handleDrop = (e, cell) => {
    if (!onBoothMove) return;
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    if (id) onBoothMove(id, cell);
    setDragId(null);
    setDragOverCell(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverCell(null);
  };

  const cellSize = "minmax(88px, 1fr)";

  return (
    <div className="fp">
      {/* Hall tabs */}
      {halls.length > 0 && (
        <div className="fp__tabs" role="tablist" aria-label="Halls">
          {halls.map((h) => (
            <button
              key={h}
              type="button"
              role="tab"
              aria-selected={h === activeHall}
              className={`fp__tab ${h === activeHall ? "fp__tab--active" : ""}`}
              onClick={() => onHallChange?.(h)}
            >
              {h}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="fp__legend" aria-label="Booth status legend">
          {["Available", "Reserved", "Occupied"].map((s) => {
            const colors = STATUS_COLORS[s];
            const clickable = Boolean(onStatusFilterChange);
            const active = statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                className={`fp__legend-item ${
                  active ? "fp__legend-item--active" : ""
                }`}
                onClick={
                  clickable
                    ? () => onStatusFilterChange(active ? "All" : s)
                    : undefined
                }
                disabled={!clickable}
                title={clickable ? `Filter to ${s}` : undefined}
              >
                <span
                  className="fp__legend-swatch"
                  style={{
                    background: colors.bg,
                    borderColor: colors.border,
                  }}
                />
                {s}
              </button>
            );
          })}
          {statusFilter !== "All" && onStatusFilterChange && (
            <button
              type="button"
              className="fp__legend-clear"
              onClick={() => onStatusFilterChange("All")}
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Floor plan grid */}
      <div
        className={`fp__stage ${onBoothMove ? "fp__stage--draggable" : ""}`}
        aria-label="Floor plan grid"
      >
        {/* Entrance marker */}
        <div className="fp__entrance" aria-hidden="true">
          <span className="fp__marker-label">ENTRANCE</span>
        </div>

        <div
          className="fp__grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, ${cellSize})` }}
        >
          {Array.from({ length: ROWS }).map((_, r) => {
            // Render aisle row as a single full-width divider
            if (r === AISLE_ROW) {
              return (
                <div
                  key={`aisle-${r}`}
                  className="fp__aisle"
                  style={{ gridColumn: `1 / span ${COLS}` }}
                  aria-hidden="true"
                >
                  AISLE
                </div>
              );
            }

            return Array.from({ length: COLS }).map((__, c) => {
              const cellKey = `${c}-${r}`;
              const boothId = occupiedCells.get(cellKey);
              const booth = boothId
                ? visibleBooths.find((b) => b.id === boothId)
                : null;
              const isOver =
                dragOverCell &&
                dragOverCell.col === c &&
                dragOverCell.row === r;

              if (!booth) {
                return (
                  <div
                    key={cellKey}
                    className={`fp__empty ${
                      isOver ? "fp__empty--over" : ""
                    }`}
                    onDragOver={
                      onBoothMove
                        ? (e) => handleDragOver(e, { col: c, row: r })
                        : undefined
                    }
                    onDrop={
                      onBoothMove
                        ? (e) => handleDrop(e, { col: c, row: r })
                        : undefined
                    }
                    aria-hidden="true"
                  />
                );
              }

              const colors =
                STATUS_COLORS[booth.status] || STATUS_COLORS.Available;
              const selected = selectedBoothId === booth.id;
              const isDragging = dragId === booth.id;

              return (
                <button
                  key={booth.id}
                  type="button"
                  className={`fp__booth ${
                    selected ? "fp__booth--selected" : ""
                  } fp__booth--${booth.status.toLowerCase()} ${
                    isDragging ? "fp__booth--dragging" : ""
                  }`}
                  style={{
                    background: colors.bg,
                    borderColor: selected ? "#FFFFFF" : colors.border,
                    color: colors.text,
                  }}
                  onClick={() => onBoothSelect?.(booth.id)}
                  draggable={Boolean(onBoothMove)}
                  onDragStart={
                    onBoothMove
                      ? (e) => handleDragStart(e, booth.id)
                      : undefined
                  }
                  onDragEnd={onBoothMove ? handleDragEnd : undefined}
                  aria-label={`Booth ${booth.number}, ${booth.status}${
                    booth.exhibitorName ? `, ${booth.exhibitorName}` : ""
                  }`}
                  aria-pressed={selected}
                >
                  <span className="fp__booth-number">{booth.number}</span>
                  <span className="fp__booth-size">{booth.size}</span>
                  {booth.exhibitorName && (
                    <span
                      className="fp__booth-exhibitor"
                      title={booth.exhibitorName}
                    >
                      {booth.exhibitorName}
                    </span>
                  )}
                </button>
              );
            });
          })}
        </div>

        {/* Exit marker */}
        <div className="fp__exit" aria-hidden="true">
          <span className="fp__marker-label">EXIT</span>
        </div>
      </div>

      {visibleBooths.length === 0 && (
        <div className="fp__empty-state">
          <p>No booths match the current filter in this hall.</p>
        </div>
      )}
    </div>
  );
}