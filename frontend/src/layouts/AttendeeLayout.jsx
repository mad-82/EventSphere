import { useState } from "react";
import { Outlet } from "react-router-dom";
import AttendeeSidebar from "../components/common/AttendeeSidebar";
import AttendeeNavbar from "../components/common/AttendeeNavbar";
import "./AttendeeLayout.css";

export default function AttendeeLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 1024) setMobileOpen((v) => !v);
    else setSidebarCollapsed((v) => !v);
  };

  return (
    <div className="att-layout">
      <AttendeeSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="att-main">
        <AttendeeNavbar onToggleSidebar={handleToggleSidebar} />
        <main className="att-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}