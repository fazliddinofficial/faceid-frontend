import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AttendanceList from './pages/AttendanceList';


export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e5e5e5',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        height: '56px',
      }}>
        <span style={{ fontWeight: 600, fontSize: '16px', color: '#111' }}>
          Attendance
        </span>
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            textDecoration: 'none',
            fontSize: '14px',
            color: isActive ? '#111' : '#888',
            borderBottom: isActive ? '2px solid #111' : '2px solid transparent',
            paddingBottom: '2px',
          })}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/attendance"
          style={({ isActive }) => ({
            textDecoration: 'none',
            fontSize: '14px',
            color: isActive ? '#111' : '#888',
            borderBottom: isActive ? '2px solid #111' : '2px solid transparent',
            paddingBottom: '2px',
          })}
        >
          Attendance
        </NavLink>
      </nav>

      {/* Pages */}
      <main style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/attendance" element={<AttendanceList />} />
        </Routes>
      </main>
    </div>
  );
}