import React from "react";
import { Routes, Route } from "react-router-dom";

import ScrollToTop from "./ScrollToTop";
import Layout from "./layout/Layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors";
import DoctorDetails from "./pages/DoctorDetails";
import BookingPage from "./pages/BookingPage";
import Appointment from "./pages/Appointments";
import Profile from "./pages/Profile";
import About from "./pages/About";

function App() {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctor/:doctorId" element={<DoctorDetails />} />
            <Route path="/book-appointment" element={<BookingPage />} />
            <Route path="/appointment/:id" element={<Appointment />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </Layout>
    </>
  );
}

export default App;
