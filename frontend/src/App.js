import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

function getUser() {
  try {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('user');
    if (!token || !user) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }

    return JSON.parse(user);
  } catch { return null; }
}

function PrivateRoute({ children }) {
  return getUser() ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  return getUser() ? <Navigate to="/" replace /> : children;
}

export default function App() {
  // Default is always LIGHT, saved in localStorage
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage isDark={isDark} setIsDark={setIsDark} />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage isDark={isDark} setIsDark={setIsDark} />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}