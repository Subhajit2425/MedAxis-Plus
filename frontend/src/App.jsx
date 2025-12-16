import React from "react";
import { Routes, Route } from "react-router-dom";

import ScrollToTop from "./ScrollToTop";
import Layout from "./layout/Layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import DoctorsRegister from "./pages/DoctorsRegister";
import Doctors from "./pages/Doctors";
import DoctorDetails from "./pages/DoctorDetails";
import BookingPage from "./pages/BookingPage";
import Appointment from "./pages/Appointments";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";

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
