import { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "./Sidebar";
import Footer from "../components/Footer/Footer";
import "./Layout.css";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔒 Lock background scroll when sidebar is open (mobile UX)
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // 🔁 Toggle sidebar (menu click)
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app-shell">
      {/* Top navbar */}
      <Navbar onMenuClick={toggleSidebar} />

      {/* Sidebar + content */}
      <div className="app-layout">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="app-main">
          <div className="app-content">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
