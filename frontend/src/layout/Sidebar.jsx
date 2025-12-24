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

  const closeSidebar = () => setOpen(false);

  const handleDoctorDashboard = async () => {
    const email = localStorage.getItem("userEmail");

    if (!email) {
      navigate("/login", {
        state: {
          snackbar: {
            message: "Please login to open the doctor dashboard.",
            severity: "warning",
          },
        },
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

      if (!registered) navigate("/doctor/entry");
      else if (requestStatus === "pending" || requestStatus === "rejected")
        navigate("/doctor/status");
      else if (!hasAvailability) navigate("/doctor/status");
      else if (canAccessBooking) navigate("/doctor/dashboard");
      else navigate("/doctor/status");

      closeSidebar();
    } catch (err) {
      console.error("Doctor dashboard access error:", err);
      closeSidebar();
    }
  };

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <nav className="sidebar-nav">

          {/* EXPLORE */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">EXPLORE</div>

            <Link className={`sidebar-link ${isActive("/")}`} to="/" onClick={closeSidebar}>
              <Home className="sidebar-icon" />
              <span>Home</span>
            </Link>

            <Link className={`sidebar-link ${isActive("/doctors")}`} to="/doctors" onClick={closeSidebar}>
              <LocalHospital className="sidebar-icon" />
              <span>Doctors</span>
            </Link>

            <Link className={`sidebar-link ${isActive("/appointments")}`} to="/appointments" onClick={closeSidebar}>
              <Event className="sidebar-icon" />
              <span>Appointments</span>
            </Link>
          </div>

          {/* DOCTOR USE */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">DOCTOR USE</div>

            <button
              className={`sidebar-link ${isActive("/doctor/dashboard")}`}
              onClick={handleDoctorDashboard}
            >
              <MedicalServices className="sidebar-icon" />
              <span>Doctor Dashboard</span>
            </button>
          </div>

          {/* MORE */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">MORE</div>

            <Link className={`sidebar-link ${isActive("/contact")}`} to="/contact" onClick={closeSidebar}>
              <ContactSupport className="sidebar-icon" />
              <span>Contact Us</span>
            </Link>

            <Link className={`sidebar-link ${isActive("/feedback")}`} to="/feedback" onClick={closeSidebar}>
              <Feedback className="sidebar-icon" />
              <span>Feedback</span>
            </Link>

            <Link className={`sidebar-link ${isActive("/privacy")}`} to="/privacy" onClick={closeSidebar}>
              <PrivacyTip className="sidebar-icon" />
              <span>Privacy Policy</span>
            </Link>

            <Link className={`sidebar-link ${isActive("/about")}`} to="/about" onClick={closeSidebar}>
              <Info className="sidebar-icon" />
              <span>About</span>
            </Link>
          </div>

          {/* ADMIN */}
          {isAdmin && (
            <div className="sidebar-group">
              <div className="sidebar-group-title">ADMIN USE</div>

              <Link className={`sidebar-link ${isActive("/admin")}`} to="/admin" onClick={closeSidebar}>
                <AdminPanelSettings className="sidebar-icon" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
