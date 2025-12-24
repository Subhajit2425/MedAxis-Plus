import React, { useEffect, useState } from "react";
import api from "../../../api/api";

import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaUserNurse,
  FaEnvelope,
  FaCalendarAlt
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import "./DoctorDetails.css";

import {
  Container,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function DoctorDetails() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/api/doctors/${doctorId}`)
      .then((res) => {
        setDoctor(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load doctor details");
        setLoading(false);
      });
  }, [doctorId]);

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
        <Typography mt={2}>Loading doctor profile…</Typography>
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

        {/* ================= HEADER ================= */}
        <div className="doctor-header">
          <div className="doctor-header-left">
            <div className="doctor-avatar">
              <FaUserNurse size={32} />
            </div>

            <div className="doctor-basic">
              <h1 className="doctor-name">{doctor.name}</h1>
              <p className="doctor-spec">{doctor.specialization}</p>
            </div>
          </div>

          <button
            className="book-appointment-btn"
            onClick={() => {
              if (localStorage.getItem("userEmail")) {
                navigate(
                  `/doctors/book-slot?doctorId=${doctor.id}&doctorName=${encodeURIComponent(
                    doctor.name
                  )}`
                );
              } else {
                navigate("/login", {
                  state: {
                    snackbar: {
                      message: "Please login to book an appointment.",
                      severity: "warning",
                    },
                  },
                });
              }
            }}
          >
            Book Appointment
          </button>
        </div>

        {/* ================= INFO GRID ================= */}
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

          <div className="info-item">
            <FaEnvelope className="info-icon" />
            <div>
              <p className="info-label">Email</p>
              <p className="info-value">{doctor.email}</p>
            </div>
          </div>

          <div className="info-item">
            <FaCalendarAlt className="info-icon" />
            <div>
              <p className="info-label">Member Since</p>
              <p className="info-value">
                {new Date(doctor.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="info-item full">
            <FaMapMarkerAlt className="info-icon" />
            <div>
              <p className="info-label">Clinic Address</p>
              <p className="info-value">{doctor.address}</p>
            </div>
          </div>
        </div>

        {/* ================= MAP ================= */}
        {doctor.latitude && doctor.longitude && (
          <div className="map-container">
            <iframe
              title="Doctor Location"
              width="100%"
              height="260"
              loading="lazy"
              style={{ border: 0, borderRadius: "14px" }}
              src={`https://www.google.com/maps?q=${doctor.latitude},${doctor.longitude}&z=15&output=embed`}
            ></iframe>
          </div>
        )}

        {/* ================= FOOTER ================= */}
        <div className="doctor-footer">
          Verified medical professional. Appointment availability, reviews and
          clinic timings will be displayed here.
        </div>
      </div>
    </div>
  );
}
