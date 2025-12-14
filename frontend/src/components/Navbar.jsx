import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { useEffect, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("userEmail"));
  }, [location.pathname]); // 🔥 re-check on route change

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">MedAxis+</Link>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/doctors">Doctors</Link></li>
        <li><Link to="/appointments">Appointments</Link></li>
        <li><Link to="/about">About</Link></li>

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
