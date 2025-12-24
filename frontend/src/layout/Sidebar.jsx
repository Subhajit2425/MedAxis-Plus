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

  const closeSidebar = () => {
    setOpen(false);
  };

  // sidebarIconStyle.js
  const sidebarIconSx = (active) => ({
    '& path': {
      fill: active ? '#0f172a' : '#cbd5e1',
      transition: 'fill 0.2s ease'
    }
  });

  const isDoctorsRoute = () =>
    location.pathname === "/doctors" ||
    location.pathname.startsWith("/doctor/");


  const handleDoctorDashboard = async () => {
    const email = localStorage.getItem("userEmail");

    if (!email) {
      navigate("/login", {
        state: {
          snackbar: {
            message: "Please login to open the doctor dashboard.",
            severity: "warning"
          }
        }
      });
      closeSidebar();
      return;
    }

    try {
      const res = await api.get("/api/doctor/access", {
        params: { email },
      });

      const {
        registered,
        requestStatus,
        canAccessBooking,
        hasAvailability,
      } = res.data;

      if (!registered) {
        navigate("/doctor/entry");
      } else if (requestStatus === "pending" || requestStatus === "rejected") {
        navigate("/doctor/status");
      } else if (!hasAvailability) {
        // ✅ approved but profile incomplete
        navigate("/doctor/status");
      } else if (canAccessBooking) {
        // ✅ approved + availability completed
        navigate("/doctor/dashboard");
      } else {
        navigate("/doctor/status");
      }

      closeSidebar();
    } catch (err) {
      console.error("Doctor dashboard access error:", err);
      closeSidebar();
    }
  };



  return (
    <>
      {/* 🔥 MOBILE OVERLAY */}
      {open && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <nav className="sidebar-nav">

          {/* 🔍 EXPLORE */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">EXPLORE</div>

            <Link className={isActive("/")} to="/" onClick={closeSidebar}>
              <Home sx={sidebarIconSx(isActive("/"))} /> Home
            </Link>


            <Link
              className={`sidebar-link ${isDoctorsRoute() ? "active" : ""}`}
              to="/doctors"
              onClick={closeSidebar}
            >
              <LocalHospital sx={sidebarIconSx(isDoctorsRoute())} />
              <span>Doctors</span>
            </Link>


            <Link className={isActive("/appointments")} to="/appointments" onClick={closeSidebar}>
              <Event sx={sidebarIconSx(isActive("/appointments"))} /> Appointments
            </Link>
          </div>

          {/* 🩺 DOCTOR USE */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">DOCTOR USE</div>

            <button
              className={`sidebar-link ${isActive("/doctor/dashboard")}`}
              onClick={handleDoctorDashboard}
            >
              <MedicalServices sx={sidebarIconSx(isActive("/doctor/dashboard"))} /> Doctor Dashboard
            </button>
          </div>

          {/* ℹ️ MORE */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">MORE</div>

            <Link className={isActive("/contact")} to="/contact" onClick={closeSidebar}>
              <ContactSupport sx={sidebarIconSx(isActive("/contact"))} /> Contact Us
            </Link>

            <Link className={isActive("/feedback")} to="/feedback" onClick={closeSidebar}>
              <Feedback sx={sidebarIconSx(isActive("/feedback"))} /> Feedback
            </Link>

            <Link className={isActive("/privacy")} to="/privacy" onClick={closeSidebar}>
              <PrivacyTip sx={sidebarIconSx(isActive("/privacy"))} /> Privacy Policy
            </Link>

            <Link className={isActive("/about")} to="/about" onClick={closeSidebar}>
              <Info sx={sidebarIconSx(isActive("/about"))} /> About
            </Link>
          </div>

          {/* 🔐 ADMIN */}
          {isAdmin && (
            <div className="sidebar-group">
              <div className="sidebar-group-title">ADMIN USE</div>

              <Link className={isActive("/admin")} to="/admin" onClick={closeSidebar}>
                <AdminPanelSettings sx={sidebarIconSx(isActive("/admin"))} /> Admin Dashboard
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
