import { useState } from "react";
import { Outlet } from "react-router-dom";
import ExhibitorSidebar from "../components/common/ExhibitorSidebar";
import ExhibitorNavbar from "../components/common/ExhibitorNavbar";
import "./ExhibitorLayout.css";

export default function ExhibitorLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setMobileOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => !v);
    }
  };

  return (
    <div className="exb-layout">
      <ExhibitorSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="exb-main">
        <ExhibitorNavbar onToggleSidebar={handleToggleSidebar} />
        <main className="exb-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}