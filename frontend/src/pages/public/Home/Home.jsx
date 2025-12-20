import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Snackbar,
} from "@mui/material";

// Icons
import {
  FaTooth,
  FaHeartbeat,
  FaBrain,
  FaEye,
  FaStethoscope,
  FaHandHoldingMedical,
  FaVial,
  FaPills,
  FaHospitalSymbol,
  FaAmbulance,
  FaFemale,
  FaBone,
  FaClinicMedical,
  FaBaby,
  FaUtensils,
  FaMedkit,
} from "react-icons/fa";

// ---------------- DATA ----------------
const specialtiesData = [
  { name: "Dentist", Icon: FaTooth },
  { name: "Cardiologist", Icon: FaHeartbeat },
  { name: "Neurologist", Icon: FaBrain },
  { name: "Ophthalmologist", Icon: FaEye },
  { name: "Psychiatrist", Icon: FaStethoscope },
  { name: "Gastroenterologist", Icon: FaUtensils },
  { name: "ENT Specialist", Icon: FaMedkit },
  { name: "Dermatologist", Icon: FaHandHoldingMedical },
  { name: "General Physician", Icon: FaClinicMedical },
  { name: "Gynecologist", Icon: FaFemale },
  { name: "Pediatrician", Icon: FaBaby },
  { name: "Orthopedic Surgeon", Icon: FaBone },
];

const servicesData = [
  { name: "Online Consultation", Icon: FaHandHoldingMedical },
  { name: "Book Lab Test", Icon: FaVial },
  { name: "Order Medicines", Icon: FaPills },
  { name: "Hospital Bookings", Icon: FaHospitalSymbol },
  { name: "Emergency Care", Icon: FaAmbulance },
];

// --------------------------------------------------------

const Home = () => {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" // success | error | warning | info
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar(prev => ({ ...prev, open: false }));
    setTimeout(() => {
      setSnackbar({ open: true, message, severity });
    }, 50);
  };


  const handleSpecialization = (name) => {
    navigate(`/doctors?specialization=${encodeURIComponent(name)}`);
  };

  const handleHeroSearch = () => {
    navigate(`/doctors?search=${encodeURIComponent(heroSearch)}`);
  };

  const handleServices = (service) => {
    showSnackbar(`${service} service is unavailable right now !`, "warning");
  };

  return (
    <div className="home">

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="hero">
        <h1 className="hero-title">Find & Book Trusted Doctors</h1>
        <p className="hero-subtitle">
          Your health, our priority — trusted healthcare at your fingertips.
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search doctors, specialization, location..."
            className="search-input"
            value={heroSearch}
            onChange={(e) => setHeroSearch(e.target.value)}
          />
          {/* <input
            type="text"
            placeholder="Enter city / location"
            className="search-input"
          /> */}
          <button className="search-btn" onClick={handleHeroSearch}>
            Search
          </button>
        </div>
      </section>

      {/* ---------------- SPECIALITIES SECTION ---------------- */}
      <section className="specialities">
        <h2 className="section-title">Browse by Specialization</h2>

        <div className="spec-grid">
          {specialtiesData.map((item) => (
            <div
              key={item.name}
              className="spec-card"
              onClick={() => handleSpecialization(item.name)}
            >
              <item.Icon className="spec-icon" size={48} />
              <p className="spec-name">{item.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- TOP DOCTORS SECTION ---------------- */}
      <section className="doctors">
        <h2 className="section-title">Top Doctors</h2>

        <div className="doctor-grid">
          {[
            { id: 3, name: "Dr. Rohit Verma", speciality: "Pediatrician", exp: 10 },
            { id: 5, name: "Dr. Arjun Mehta", speciality: "Neurologist", exp: 18 },
            { id: 9, name: "Dr. Karan Malhotra", speciality: "Ophthalmologist", exp: 14 },
          ].map((doc) => (
            <div
              className="doctor-card"
              key={doc.name}
              onClick={() => navigate(`/doctor/${doc.id}`)}
            >
              <img
                src="https://img.icons8.com/ios-filled/100/user.png"
                alt="doctor"
                className="doctor-img"
              />

              <h3 className="doctor-name">{doc.name}</h3>
              <p className="doctor-spec">{doc.speciality}</p>
              <p className="doctor-exp">{doc.exp}y experience</p>

              <button
                className="book-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (localStorage.getItem("userEmail")) {
                    navigate(
                      `/book-appointment?doctorId=${doc.id}&doctorName=${encodeURIComponent(
                        doc.name
                      )}`
                    );
                  } else {
                    navigate("/login");
                  }
                }}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- SERVICES SECTION ---------------- */}
      <section className="services">
        <h2 className="section-title">Our Services</h2>

        <div className="services-grid">
          {servicesData.map((s) => (
            <div
              className="service-card"
              key={s.name}
              onClick={() => handleServices(s.name)}
            >
              <s.Icon className="service-icon" size={45} />
              <p className="service-name">{s.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- TESTIMONIALS SECTION ---------------- */}
      <section className="testimonials">
        <h2 className="section-title">What Our Users Say</h2>

        <div className="test-grid">
          {[
            "Great service! Booking is super easy.",
            "Helped me connect with a doctor instantly.",
            "Smooth app and user-friendly experience.",
          ].map((review, i) => (
            <div key={i} className="test-card">
              <p className="test-text">"{review}"</p>
            </div>
          ))}
        </div>
      </section>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // 🔥 TOP is key
        onClose={(event, reason) => {
          if (reason === "clickaway") return;
          setSnackbar({ ...snackbar, open: false });
        }}
        sx={{ zIndex: 2000 }} // 🔥 FORCE visibility
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: 2,
            boxShadow: 6,
            width: "100%"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Home;
