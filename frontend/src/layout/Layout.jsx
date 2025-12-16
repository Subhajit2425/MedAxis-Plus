import Navbar from "../components/Navbar/Navbar";
import Sidebar from "./Sidebar";
import Footer from "../components/Footer/Footer";
import "./Layout.css";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      {/* Top minimal navbar */}
      <Navbar />

      {/* Sidebar + content */}
      <div className="app-layout">
        <Sidebar />

        <div className="app-main">
          <div className="app-content">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
