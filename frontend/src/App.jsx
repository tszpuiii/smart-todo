import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Tasks from './pages/Tasks.jsx';
import Sidebar from './components/Sidebar.jsx';
// Modal removed in favor of settings page
import { ThemeProvider } from './context/ThemeContext.jsx';
// Topbar removed per request
import Weather from './pages/Weather.jsx';
import Settings from './pages/Settings.jsx';
import { LocaleProvider } from './context/LocaleContext.jsx';
import Home from './pages/Home.jsx';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export default function App() {
  const { token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useEffect(() => {
    try {
      const a = localStorage.getItem('accent') || 'blue';
      document.documentElement.setAttribute('data-accent', a);
    } catch {}
  }, []);

  return (
    <LocaleProvider>
      <ThemeProvider>
        <div className={`app-shell ${sidebarOpen && token ? 'with-sidebar' : 'no-sidebar'}`}>
          {token && <Sidebar open={!!sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />}
          <div className="app-main no-topbar">
            <div className="app-content container">
              <Routes>
                <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="/weather" element={<PrivateRoute><Weather /></PrivateRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Outlet />
            </div>
          </div>
        </div>
      </ThemeProvider>
    </LocaleProvider>
  );
}


