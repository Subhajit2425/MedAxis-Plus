import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Layout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#fff",
        color: "#000",
      }}
    >
      <Navbar />

      <div style={{ flex: 1, padding: "20px" }}>
        {children}
      </div>

      <Footer />
    </div>
  );
}
