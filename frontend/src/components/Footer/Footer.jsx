import React, { useEffect, useState } from "react";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function Footer() {
  const [showFooter, setShowFooter] = useState(false);

  // Detect when user reaches the bottom of the page
  useEffect(() => {
    const handleScroll = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;

      setShowFooter(scrolledToBottom);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const footerStyle = {
    backgroundColor: "#1e2a36",
    color: "#dfe6e9",
    padding: "50px 20px",
    marginTop: "40px",
    borderTop: "1px solid #2f3b47",
    transition: "opacity 0.6s ease, transform 0.6s ease",
    opacity: showFooter ? 1 : 0,
    transform: showFooter ? "translateY(0)" : "translateY(20px)",
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const columnStyle = {
    flex: 1,
    minWidth: "220px",
    margin: "10px 0",
  };

  const linkStyle = {
    color: "#dfe6e9",
    textDecoration: "none",
    display: "block",
    margin: "8px 0",
    fontSize: "15px",
    opacity: 0.85,
  };

  const socialIconStyle = {
    color: "#dfe6e9",
    marginRight: "15px",
    fontSize: "26px",
    cursor: "pointer",
    transition: "0.3s",
    transform: "scale(1)"
  };

  const socialHover = {
    transform: "scale(1.15)",
    color: "#74b9ff",
  };

  const copyrightStyle = {
    color: "#dfe6e9",
    textAlign: "center",
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #2f3b47",
    fontSize: "13px",
    opacity: 0.75,
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        {/* Column 1 */}
        <div style={columnStyle}>
          <h3 style={{ color: "#74b9ff", marginBottom: "15px" }}>MedAxis+</h3>
          <p style={{ color: "#dfe6e9", fontSize: "15px", lineHeight: "1.6" }}>
            Your trusted partner for booking verified doctors and managing your
            healthcare professionally.
          </p>
        </div>

        {/* Column 2 */}
        <div style={columnStyle}>
          <h4 style={{ color: "#dfe6e9", marginBottom: "15px" }}>
            Quick Links
          </h4>

          <Link to="/doctors" style={linkStyle}>Find a Doctor</Link>
          <Link to="/appointments" style={linkStyle}>My Appointments</Link>
          <Link to="/about" style={linkStyle}>About</Link>
          <Link to="/contact" style={linkStyle}>Contact</Link>
        </div>


        {/* Column 3 */}
        <div style={columnStyle}>
          <h4 style={{ color: "#dfe6e9", marginBottom: "15px" }}>
            Contact Us
          </h4>
          <p style={{ color: "#dfe6e9" }}>Email: support@medaxis.com</p>
          <p style={{ color: "#dfe6e9" }}>Phone: +91 9876543210</p>

          <div style={{ marginTop: "12px" }}>
            <Facebook
              style={socialIconStyle}
              onMouseOver={(e) => Object.assign(e.target.style, socialHover)}
              onMouseOut={(e) => Object.assign(e.target.style, socialIconStyle)}
            />
            <Twitter
              style={socialIconStyle}
              onMouseOver={(e) => Object.assign(e.target.style, socialHover)}
              onMouseOut={(e) => Object.assign(e.target.style, socialIconStyle)}
            />
            <Instagram
              style={socialIconStyle}
              onMouseOver={(e) => Object.assign(e.target.style, socialHover)}
              onMouseOut={(e) => Object.assign(e.target.style, socialIconStyle)}
            />
            <LinkedIn
              style={socialIconStyle}
              onMouseOver={(e) => Object.assign(e.target.style, socialHover)}
              onMouseOut={(e) => Object.assign(e.target.style, socialIconStyle)}
            />
          </div>
        </div>
      </div>

      <div style={copyrightStyle}>
        © {new Date().getFullYear()} MedAxis+. All rights reserved.
      </div>
    </footer>
  );
}
