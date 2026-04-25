import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const Icon = {
  globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  sun:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:13,height:13}}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:13,height:13}}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:16,height:16}}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  alert: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:14,height:14}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  spinner: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:16,height:16}} className="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{width:16,height:16}}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

export default function LoginPage({ isDark, setIsDark }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [form, setForm]         = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

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

    const particles = Array.from({ length: 40 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * 0.3,
      vy:    (Math.random() - 0.5) * 0.3,
      r:     Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(0,180,255,${p.alpha})`
          : `rgba(37,99,235,${p.alpha * 0.6})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  function validate() {
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required.';
    if (!form.password) errs.password = 'Password is required.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      const res  = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/login`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user',  JSON.stringify(data.user));
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

      <button className="theme-toggle" onClick={() => setIsDark(d => !d)}>
        {isDark ? Icon.sun : Icon.moon}
        {isDark ? 'Light' : 'Dark'}
      </button>

      <div className="login-card">
        <div className="status-tag">
          <span className="status-dot" />
          System Online
        </div>

        <div className="login-header">
          <h1>{Icon.globe} <span>IP</span> Geolocation</h1>
          <p>Sign in to access the geolocation dashboard.</p>
        </div>

        <div className="login-divider"><span>Authentication Required</span></div>

        {apiError && (
          <div className="alert-error">
            {Icon.alert} {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              className={errors.email ? 'has-error' : ''}
              onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({}); }}
            />
            {errors.email && <span className="error-msg">{Icon.alert} {errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              className={errors.password ? 'has-error' : ''}
              onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({}); }}
            />
            {errors.password && <span className="error-msg">{Icon.alert} {errors.password}</span>}
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading
              ? <>{Icon.spinner} Authenticating…</>
              : <>{Icon.lock} Sign In {Icon.arrow}</>
            }
          </button>
        </form>

        <div className="login-footer">
          <div className="footer-left">
            IP Geolocation<br />
            Dashboard v1.0
          </div>
          <div className="footer-right">
            <strong>admin@example.com</strong>
            password123
          </div>
        </div>
      </div>
    </div>
  );
}