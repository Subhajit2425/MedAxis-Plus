import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import "./Navbar.css";
import logo from "../../assets/Logo512.png";


export default function Navbar({ onMenuClick }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const isAdmin = localStorage.getItem("isAdmin");

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("userEmail"));
  }, [location.pathname]); // 🔥 re-check on route change

  return (
    <nav className="navbar">
      {/* LEFT CLUSTER */}
      <div className="navbar-left">
        <MenuIcon
          className="menu-icon"
          onClick={onMenuClick}
          fontSize="large"
        />

        <Link to="/" className="brand">
          <img src={logo} alt="MedAxis+" className="navbar-logo" />
          <span className="navbar-title">
            MedAxis<span className="plus">+</span>
          </span>
        </Link>
      </div>


      <ul className="nav-links">
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
