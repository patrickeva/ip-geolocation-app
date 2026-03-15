import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import './HomePage.css';

function isValidIP(ip) {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6  = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  if (ipv4.test(ip)) return ip.split('.').every(n => parseInt(n) <= 255);
  return ipv6.test(ip);
}

/* ── All SVG Icons ─────────────────────────────────── */
const Icon = {
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1"  x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22"   x2="5.64"  y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1"  y1="12" x2="3"  y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  city: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  coord: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function HomePage({ isDark, setIsDark }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [geoData,   setGeoData]   = useState(null);
  const [myGeoData, setMyGeoData] = useState(null);
  const [searchIP,  setSearchIP]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [ipError,   setIpError]   = useState('');
  const [history,   setHistory]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('ip_history') || '[]'); }
    catch { return []; }
  });
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    localStorage.setItem('ip_history', JSON.stringify(history));
  }, [history]);

  const fetchMyIP = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('https://ipinfo.io/geo');
      const data = await res.json();
      setMyGeoData(data);
      setGeoData(data);
    } catch {
      setIpError('Could not fetch your IP information.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMyIP(); }, [fetchMyIP]);

  async function fetchGeoForIP(ip) {
    setLoading(true);
    setIpError('');
    try {
      const res  = await fetch(`https://ipinfo.io/${ip}/geo`);
      const data = await res.json();
      if (data.bogon) {
        setIpError('Private/reserved IP — no geolocation available.');
        return null;
      }
      return data;
    } catch {
      setIpError('Failed to fetch geolocation data.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    const ip = searchIP.trim();
    if (!ip) { setIpError('Please enter an IP address.'); return; }
    if (!isValidIP(ip)) {
      setIpError('Invalid IP address. Please enter a valid IPv4 or IPv6.');
      return;
    }
    const data = await fetchGeoForIP(ip);
    if (!data) return;
    setGeoData(data);
    setHistory(prev => {
      if (prev.find(h => h.ip === ip)) return prev;
      return [{ ip, data, searchedAt: new Date().toLocaleString() }, ...prev];
    });
  }

  function handleClear() {
    setSearchIP('');
    setIpError('');
    setGeoData(myGeoData);
  }

  function handleHistoryClick(item) {
    setGeoData(item.data);
    setSearchIP(item.ip);
    setIpError('');
  }

  function toggleSelect(ip) {
    setSelected(prev =>
      prev.includes(ip) ? prev.filter(x => x !== ip) : [...prev, ip]
    );
  }

  function deleteSelected() {
    setHistory(prev => prev.filter(h => !selected.includes(h.ip)));
    setSelected([]);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  function parseCoords(loc) {
    if (!loc) return null;
    const parts = loc.split(',');
    if (parts.length !== 2) return null;
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return [lat, lng];
  }

  const coords = geoData ? parseCoords(geoData.loc) : null;

  return (
    <div className={`home-page ${isDark ? 'dark' : 'light'}`}>

      {/* ══ NAVBAR ══ */}
      <nav className="navbar">
        <div className="nav-brand">
          {Icon.globe}
          IP Geolocation
          <div className="nav-brand-dot" />
        </div>

        <div className="nav-right">
          {/* Theme toggle */}
          <button
            className="nav-theme-btn"
            onClick={() => setIsDark(d => !d)}
          >
            {isDark ? Icon.sun : Icon.moon}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Divider */}
          <div className="nav-divider" />

          {/* User chip */}
          <div className="nav-user-chip">
            {Icon.user}
            <span className="nav-user-name">{user.name || user.email}</span>
          </div>

          {/* Logout */}
          <button className="nav-logout" onClick={handleLogout}>
            {Icon.logout}
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* ══ MAIN CONTENT ══ */}
      <div className="home-container">

        {/* Search */}
        <div className="search-card">
          <div className="section-label">
            <div className="section-label-bar" />
            IP Address Lookup
          </div>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrap">
              {Icon.search}
              <input
                type="text"
                placeholder="Enter an IP address (e.g. 8.8.8.8)"
                value={searchIP}
                onChange={e => { setSearchIP(e.target.value); setIpError(''); }}
                className={ipError ? 'error' : ''}
              />
            </div>
            <button type="submit" className="btn-search" disabled={loading}>
              {loading
                ? <><div className="spinner" style={{width:13,height:13,borderWidth:2}}/> Searching…</>
                : <>{Icon.search} Search</>
              }
            </button>
            {searchIP && (
              <button type="button" className="btn-clear" onClick={handleClear}>
                {Icon.x} Clear
              </button>
            )}
          </form>
          {ipError && (
            <div className="error-msg">
              {Icon.alert} {ipError}
            </div>
          )}
        </div>

        <div className="main-grid">

          {/* Left column */}
          <div className="left-col">
            {loading && !geoData && (
              <div className="loading-card">
                <div className="spinner" />
                Fetching geolocation data…
              </div>
            )}

            {geoData && (
              <div className="geo-card">
                <div className="geo-header">
                  <div className="geo-header-left">
                    <div className="geo-badge">
                      {Icon.pin}
                      {geoData.ip === myGeoData?.ip ? 'Your IP' : 'Searched IP'}
                    </div>
                    <div className="geo-ip">{geoData.ip}</div>
                  </div>
                </div>
                <div className="geo-grid">
                  <GeoRow icon={Icon.city}     label="City"        value={geoData.city}     />
                  <GeoRow icon={Icon.map}      label="Region"      value={geoData.region}   />
                  <GeoRow icon={Icon.flag}     label="Country"     value={geoData.country}  />
                  <GeoRow icon={Icon.mail}     label="Postal"      value={geoData.postal}   />
                  <GeoRow icon={Icon.building} label="Org / ISP"   value={geoData.org}      />
                  <GeoRow icon={Icon.clock}    label="Timezone"    value={geoData.timezone} />
                  <GeoRow icon={Icon.coord}    label="Coordinates" value={geoData.loc}      />
                </div>
              </div>
            )}

            {coords && (
              <div className="map-card">
                <div className="map-header">
                  {Icon.pin} Live Location Map
                </div>
                <MapView
                  coords={coords}
                  label={`${geoData.city || ''}, ${geoData.country || ''} — ${geoData.ip}`}
                />
              </div>
            )}
          </div>

          {/* History */}
          <div className="right-col">
            <div className="history-card">
              <div className="history-header">
                <div className="history-title-wrap">
                  {Icon.history}
                  Search History
                  {history.length > 0 && (
                    <span className="history-count">{history.length}</span>
                  )}
                </div>
                {selected.length > 0 && (
                  <button className="btn-delete" onClick={deleteSelected}>
                    {Icon.trash} Delete ({selected.length})
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="history-empty">
                  {Icon.search}
                  <p>No searches yet</p>
                </div>
              ) : (
                <ul className="history-list">
                  {history.map(item => (
                    <li
                      key={item.ip}
                      className={`history-item ${selected.includes(item.ip) ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(item.ip)}
                        onChange={() => toggleSelect(item.ip)}
                        onClick={e => e.stopPropagation()}
                      />
                      <div className="history-info" onClick={() => handleHistoryClick(item)}>
                        <span className="history-ip">{item.ip}</span>
                        <span className="history-location">
                          {[item.data.city, item.data.region, item.data.country]
                            .filter(Boolean).join(', ')}
                        </span>
                        <span className="history-time">{item.searchedAt}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── GeoRow helper ── */
function GeoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="geo-row">
      <div className="geo-icon-box">{icon}</div>
      <div className="geo-text">
        <span className="geo-label">{label}</span>
        <span className="geo-value">{value}</span>
      </div>
    </div>
  );
}