import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "./Sidebar";
import Footer from "../components/Footer/Footer";
import MenuIcon from "@mui/icons-material/Menu";
import "./Layout.css";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Top navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

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
