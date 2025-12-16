import React from "react";
import { Routes, Route } from "react-router-dom";

import ScrollToTop from "./ScrollToTop";
import Layout from "./layout/Layout";

import Home from "./pages/public/Home/Home";
import Login from "./pages/auth/Login";
import DoctorsRegister from "./pages/doctors/auth/DoctorRegister";
import Doctors from "./pages/doctors/list/Doctors";
import DoctorDetails from "./pages/doctors/details/DoctorDetails";
import BookingPage from "./pages/user/BookingPage";
import Appointment from "./pages/user/Appointments";
import Profile from "./pages/auth/Profile";
import About from "./pages/public/About/About";
import Contact from "./pages/public/Contact/Contact";

function App() {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<DoctorsRegister />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctor/:doctorId" element={<DoctorDetails />} />
            <Route path="/book-appointment" element={<BookingPage />} />
            <Route path="/appointments" element={<Appointment />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </Layout>
    </>
  );
}

export default App;
