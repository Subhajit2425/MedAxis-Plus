import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
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

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const isAdmin = localStorage.getItem("isAdmin");
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  const handleDoctorDashboard = async () => {
    const email = localStorage.getItem("userEmail");

    // 1️⃣ Not logged in
    if (!email) {
      navigate("/login");
      return;
    }

    try {
      const res = await api.get("/api/doctor/access", {
        params: { email }
      });

      const data = res.data;

      // 2️⃣ Logged in but not registered
      if (!data.registered) {
        navigate("/doctor/entry");
      }
      // 3️⃣ Registered but not approved
      else if (data.status === "pending" || data.status === "rejected") {
        navigate("/doctor/status");
      }
      // 4️⃣ Approved
      else if (data.status === "approved") {
        navigate("/doctor/dashboard");
      }
    } catch (err) {
      console.error("Doctor dashboard access error:", err);
    }
  };

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <nav className="sidebar-nav">

        {/* 🔍 EXPLORE */}
        <div className="sidebar-group">
          <div className="sidebar-group-title">EXPLORE</div>

          <Link className={isActive("/")} to="/" onClick={() => setOpen(false)}>
            <Home /> Home
          </Link>

          <Link className={isActive("/doctors")} to="/doctors" onClick={() => setOpen(false)}>
            <LocalHospital /> Doctors
          </Link>

          <Link className={isActive("/appointments")} to="/appointments" onClick={() => setOpen(false)}>
            <Event /> Appointments
          </Link>
        </div>

        {/* 🩺 DOCTOR USE */}
        <div className="sidebar-group">
          <div className="sidebar-group-title">DOCTOR USE</div>

          <button
            className={`sidebar-link ${isActive("/doctor/dashboard")}`}
            onClick={() => {
              setOpen(false);
              handleDoctorDashboard();
            }}
          >
            <MedicalServices /> Doctor Dashboard
          </button>

        </div>

        {/* ℹ️ MORE */}
        <div className="sidebar-group">
          <div className="sidebar-group-title">MORE</div>

          <Link className={isActive("/contact")} to="/contact" onClick={() => setOpen(false)}>
            <ContactSupport /> Contact Us
          </Link>

          <Link className={isActive("/feedback")} to="/feedback" onClick={() => setOpen(false)}>
            <Feedback /> Feedback
          </Link>

          <Link className={isActive("/privacy")} to="/privacy" onClick={() => setOpen(false)}>
            <PrivacyTip /> Privacy Policy
          </Link>

          <Link className={isActive("/about")} to="/about" onClick={() => setOpen(false)}>
            <Info /> About
          </Link>
        </div>

        {/* 🔐 ADMIN USE (ONLY ADMIN SEES THIS) */}
        {isAdmin && (
          <div className="sidebar-group">
            <div className="sidebar-group-title">ADMIN USE</div>

            <Link className={isActive("/admin")} to="/admin" onClick={() => setOpen(false)}>
              <AdminPanelSettings /> Admin Dashboard
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
