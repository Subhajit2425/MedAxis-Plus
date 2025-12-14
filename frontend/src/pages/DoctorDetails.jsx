import React, { useEffect, useState } from "react";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaUserNurse
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DoctorDetails.css";

import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  colors
} from "@mui/material";

export default function DoctorDetails() {
  const { doctorId } = useParams(); // from route
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/doctors/${doctorId}`)
      .then((res) => {
        setDoctor(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load doctor details");
        setLoading(false);
      });
  }, [doctorId]);

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
        <Typography mt={2}>Loading Doctor Details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className="doctor-details-page">
      <div className="doctor-card-pro">
        {/* Header */}
        <div className="doctor-header">
          <div className="doctor-header-left">
            <div className="doctor-avatar">
              <FaUserNurse style={{ color: "white" }} size={34} />
            </div>
            <div>
              <h1 className="doctor-name">{doctor.name}</h1>
              <p className="doctor-spec">{doctor.specialization}</p>
            </div>
          </div>

          {/* Book Appointment Button */}
          <button
            className="book-appointment-btn"
            onClick={() => {
              if (localStorage.getItem("userEmail")) {
                navigate(
                  `/book-appointment?doctorId=${doctor.id}&doctorName=${encodeURIComponent(
                    doctor.name
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

        {/* Info Grid */}
        <div className="doctor-info-grid">
          <div className="info-item">
            <FaBriefcase className="info-icon" />
            <div>
              <p className="info-label">Experience</p>
              <p className="info-value">{doctor.experience} years</p>
            </div>
          </div>

          <div className="info-item">
            <FaRupeeSign className="info-icon" />
            <div>
              <p className="info-label">Consultation Fees</p>
              <p className="info-value">₹ {doctor.fees}</p>
            </div>
          </div>

          <div className="info-item full">
            <FaMapMarkerAlt className="info-icon" />
            <div>
              <p className="info-label">Clinic Address</p>
              <p className="info-value">{doctor.address}</p>
            </div>
          </div>

          {doctor.latitude && doctor.longitude && (
            <div className="map-container">
              <iframe
                title="Doctor Location"
                width="100%"
                height="250"
                loading="lazy"
                style={{ border: 0, borderRadius: "12px" }}
                src={`https://www.google.com/maps?q=${doctor.latitude},${doctor.longitude}&z=15&output=embed`}
              ></iframe>
            </div>
          )}


        </div>

        {/* Footer */}
        <div className="doctor-footer">
          Qualifications, availability, reviews and booking details will be
          displayed here.
        </div>
      </div>
    </div>
  );
}
