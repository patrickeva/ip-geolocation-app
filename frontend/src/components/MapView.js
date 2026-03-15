import React, { useEffect, useRef } from 'react';

export default function MapView({ coords, label }) {
  const mapRef      = useRef(null);
  const instanceRef = useRef(null);
  const markerRef   = useRef(null);

  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current) return;

    if (instanceRef.current) {
      instanceRef.current.setView(coords, 10);
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = L.marker(coords)
        .addTo(instanceRef.current)
        .bindPopup(label)
        .openPopup();
      return;
    }

    const map = L.map(mapRef.current).setView(coords, 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    markerRef.current   = L.marker(coords).addTo(map).bindPopup(label).openPopup();
    instanceRef.current = map;
  }, [coords, label]);

  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ height: 280, width: '100%', borderRadius: 12, zIndex: 0 }}
    />
  );
}