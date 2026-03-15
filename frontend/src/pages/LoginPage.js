import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const API_URL = 'https://ip-geolocation-backend.vercel.app/api/login';

const Icons = {
  login: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  ),
  spinner: (
    <svg className="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
};

function useParticles(canvasRef, isDark) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const TOTAL = 45;
    const particles = Array.from({ length: TOTAL }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 1.6 + 0.3,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const color = isDark ? 'rgba(0,180,255,' : 'rgba(37,99,235,';

      for (let i = 0; i < TOTAL; i++) {
        for (let j = i + 1; j < TOTAL; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `${color}${(1 - dist / 130) * 0.12})`;
            ctx.lineWidth   = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef, isDark]);
}

function useCoords() {
  const [coords, setCoords] = useState({ lat: '14.0010', lng: '120.0028' });
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setCoords({
          lat: pos.coords.latitude.toFixed(4),
          lng: pos.coords.longitude.toFixed(4),
        });
      });
    }
  }, []);
  return coords;
}

export default function LoginPage({ isDark, setIsDark }) {
  const navigate  = useNavigate();
  const canvasRef = useRef(null);
  const coords    = useCoords();

  const [form, setForm]         = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  useParticles(canvasRef, isDark);

  function validate() {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Invalid email address.';
    }
    if (!form.password) {
      errs.password = 'Password is required.';
    } else if (form.password.length < 6) {
      errs.password = 'Min. 6 characters.';
    }
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      const res  = await fetch(API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setApiError(data.message || 'Authentication failed.');
      }
    } catch {
      setApiError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`login-page ${isDark ? 'dark' : 'light'}`}>
      <canvas ref={canvasRef} id="particle-canvas" />
      <div className="orb-1" />
      <div className="orb-2" />

      {/* Theme toggle */}
      <button className="theme-toggle" onClick={() => setIsDark(d => !d)}>
        {isDark ? Icons.sun : Icons.moon}
        <span>{isDark ? 'Light' : 'Dark'}</span>
      </button>

      <div className="login-card">

        {/* Status tag */}
        <div className="status-tag">
          <div className="status-dot" />
          System Online · {coords.lat}°N {coords.lng}°E
        </div>

        {/* Header */}
        <div className="login-header">
          <h1>IP <span>Geolocation</span><br/>Dashboard</h1>
          <p>Enter your credentials to continue</p>
        </div>

        {/* Divider */}
        <div className="login-divider">
          <span>Secure Login</span>
        </div>

        {/* Error */}
        {apiError && (
          <div className="alert-error">
            {Icons.alert} {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? 'has-error' : ''}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />
            {errors.email && (
              <span className="error-msg">{Icons.alert} {errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••••"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'has-error' : ''}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="error-msg">{Icons.alert} {errors.password}</span>
            )}
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? Icons.spinner : Icons.login}
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <div className="footer-left">
            Signal Encrypted<br/>
            TLS 1.3 · AES-256
          </div>
          <div className="footer-right">
            <strong>admin@example.com</strong>
            <strong>password123</strong>
          </div>
        </div>

      </div>
    </div>
  );
}