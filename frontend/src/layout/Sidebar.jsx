import { Link, useLocation } from "react-router-dom";
import {
  Home,
  LocalHospital,
  Event,
  MedicalServices,
  ContactSupport,
  Feedback,
  PrivacyTip,
  Info,
  AdminPanelSettings,
} from "@mui/icons-material";
import "./Layout.css";

export default function Sidebar() {
  const location = useLocation();
  const isAdmin = localStorage.getItem("isAdmin");

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">

        {/* 🔍 EXPLORE */}
        <div className="sidebar-group">
          <div className="sidebar-group-title">EXPLORE</div>

          <Link className={isActive("/")} to="/">
            <Home /> Home
          </Link>

          <Link className={isActive("/doctors")} to="/doctors">
            <LocalHospital /> Doctors
          </Link>

          <Link className={isActive("/appointments")} to="/appointments">
            <Event /> Appointments
          </Link>
        </div>

        {/* 🩺 DOCTOR USE */}
        <div className="sidebar-group">
          <div className="sidebar-group-title">DOCTOR USE</div>

          <Link
            className={isActive("/doctor/dashboard")}
            to="/doctor/dashboard"
          >
            <MedicalServices /> Doctor Dashboard
          </Link>
        </div>

        {/* ℹ️ MORE */}
        <div className="sidebar-group">
          <div className="sidebar-group-title">MORE</div>

          <Link className={isActive("/contact")} to="/contact">
            <ContactSupport /> Contact Us
          </Link>

          <Link className={isActive("/feedback")} to="/feedback">
            <Feedback /> Feedback
          </Link>

          <Link className={isActive("/privacy")} to="/privacy">
            <PrivacyTip /> Privacy Policy
          </Link>

          <Link className={isActive("/about")} to="/about">
            <Info /> About
          </Link>
        </div>

        {/* 🔐 ADMIN USE (ONLY ADMIN SEES THIS) */}
        {isAdmin && (
          <div className="sidebar-group">
            <div className="sidebar-group-title">ADMIN USE</div>

            <Link className={isActive("/admin")} to="/admin">
              <AdminPanelSettings /> Admin Dashboard
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
