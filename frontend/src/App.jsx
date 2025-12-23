import React from "react";
import { Routes, Route } from "react-router-dom";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ScrollToTop from "./ScrollToTop";
import Layout from "./layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/public/Home/Home";
import Login from "./pages/auth/Login";
import Profile from "./pages/auth/Profile";

import Doctors from "./pages/doctors/list/Doctors";
import DoctorDetails from "./pages/doctors/details/DoctorDetails";
import SlotBooking from "./pages/user/SlotBooking";
import BookingPage from "./pages/user/BookingPage";
import Appointment from "./pages/user/Appointments";
import AppointmentDetails from "./pages/user/AppointmentDetails";

import DoctorEmail from "./pages/doctors/auth/DoctorEmail";
import DoctorVerifyOtp from "./pages/doctors/auth/DoctorVerifyOtp";
import DoctorRegister from "./pages/doctors/auth/DoctorRegister";
import CompleteProfile from "./pages/doctors/auth/CompleteProfile";
import DoctorDashboard from "./pages/doctors/dashboard/DoctorDashboard";
import DoctorLoginEntry from "./pages/doctors/dashboard/DoctorLoginEntry";
import DoctorStatus from "./pages/doctors/dashboard/DoctorStatus";

import Contact from "./pages/public/Contact/Contact";
import PrivacyPolicy from "./pages/public/Privacy/PrivacyPolicy";
import About from "./pages/public/About/About";

function App() {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctor/:doctorId" element={<DoctorDetails />} />

            <Route path="/book-slot" element={<SlotBooking />} />
            <Route path="/book-appointment" element={<BookingPage />} />
            <Route path="/appointments" element={<Appointment />} />
            <Route path="/appointments/:id" element={<AppointmentDetails />} />

            <Route path="/doctor/login" element={<DoctorEmail />} />
            <Route path="/doctor/verify" element={<DoctorVerifyOtp />} />
            <Route path="/doctor/register" element={<DoctorRegister />} />
            <Route path="/doctor/complete-profile" element={<CompleteProfile />} />
            <Route path="/doctor/entry" element={<DoctorLoginEntry />} />
            <Route path="/doctor/status" element={<DoctorStatus />} />


            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/about" element={<About />} />

            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>
      </Layout>
    </>
  );
}

export default App;
