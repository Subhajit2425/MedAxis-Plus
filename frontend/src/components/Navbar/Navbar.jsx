import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { useEffect, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import logo from "../../assets/Logo512.png";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const isAdmin = localStorage.getItem("isAdmin");

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("userEmail"));
  }, [location.pathname]); // 🔥 re-check on route change

  return (
    <nav className="navbar">
      {/* LEFT SIDE: LOGO + NAME */}
      <Link to="/" className="navbar-left">
        <img src={logo} alt="MedAxis+" className="navbar-logo" />
        <span className="navbar-title">
          MedAxis<span className="plus">+</span>
        </span>
      </Link>


      <ul className="nav-links">
        {/* <li><Link to="/">Home</Link></li>
        <li><Link to="/doctors">Doctors</Link></li>
        <li><Link to="/appointments">Appointments</Link></li>
        
        {isAdmin && (
          <li>
            <Link to="/admin" className="admin-link">
              Admin
            </Link>
          </li>
        )} */}


        {/* Profile */}
        {isLoggedIn && (
          <li>
            <Link
              to="/profile"
              style={{
                display: "flex",
                alignItems: "center",
                color: "inherit",
                textDecoration: "none",
              }}
              className="profile-icon"
            >
              <AccountCircleIcon />
            </Link>
          </li>
        )}

        {/* Login */}
        {!isLoggedIn && (
          <li>
            <Link to="/login" className="login-btn">
              Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
