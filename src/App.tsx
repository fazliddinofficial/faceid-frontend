import { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AttendanceList from "./pages/AttendanceList";
import CreateCourse from "./pages/CreateCourse";
import Course from "./pages/Courses";
import FaceDetector from "./pages/FaceApi";

const navLinks = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/attendance", label: "Attendance" },
  { to: "/courses/new", label: "Create Course" },
  { to: "/courses/all", label: "All Courses" },
  { to: "/face", label: "Face" },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkStyle = (isActive: boolean) => ({
    textDecoration: "none",
    fontSize: "14px",
    color: isActive ? "#111" : "#888",
    borderBottom: isActive ? "2px solid #111" : "2px solid transparent",
    paddingBottom: "2px",
  });

  const mobileLinkStyle = (isActive: boolean) => ({
    textDecoration: "none",
    fontSize: "15px",
    color: isActive ? "#111" : "#555",
    padding: "12px 16px",
    borderLeft: isActive ? "3px solid #111" : "3px solid transparent",
    display: "block",
    background: isActive ? "#f5f5f5" : "transparent",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e5e5",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "16px", color: "#111" }}>
          Attendance
        </span>

        {/* Desktop links */}
        <div
          style={{ display: "flex", gap: "28px", alignItems: "center" }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              style={({ isActive }) => linkStyle(isActive)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Hamburger button */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="hamburger"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            display: "none",
            flexDirection: "column",
            gap: "5px",
          }}
          aria-label="Toggle menu"
        >
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "#111",
              borderRadius: 2,
              transition: "transform 0.2s",
              transform: menuOpen
                ? "rotate(45deg) translate(5px, 5px)"
                : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "#111",
              borderRadius: 2,
              opacity: menuOpen ? 0 : 1,
              transition: "opacity 0.2s",
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "#111",
              borderRadius: 2,
              transition: "transform 0.2s",
              transform: menuOpen
                ? "rotate(-45deg) translate(5px, -5px)"
                : "none",
            }}
          />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{ background: "#fff", borderBottom: "1px solid #e5e5e5" }}
          className="mobile-menu"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              style={({ isActive }) => mobileLinkStyle(isActive)}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Pages */}
      <main
        style={{ padding: "24px 16px", maxWidth: "1100px", margin: "0 auto" }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/attendance" element={<AttendanceList />} />
          <Route path="/courses/new" element={<CreateCourse />} />
          <Route path="/courses/all" element={<Course />} />
          <Route path="/face" element={<FaceDetector />} />
        </Routes>
      </main>

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
        @media (min-width: 641px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </div>
  );
}
