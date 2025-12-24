import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

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
  }, [location.pathname]);

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="navbar-left">
        <MenuIcon
          className="menu-icon"
          onClick={onMenuClick}
        />

        <Link to="/" className="brand">
          <img src={logo} alt="MedAxis+" className="navbar-logo" />
          <span className="navbar-title">
            MedAxis<span className="plus">+</span>
          </span>
        </Link>
      </div>

      {/* RIGHT */}
      <ul className="nav-links">
        {isLoggedIn && (
          <li>
            <Link to="/profile" className="profile-icon">
              <AccountCircleIcon />
            </Link>
          </li>
        )}

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
