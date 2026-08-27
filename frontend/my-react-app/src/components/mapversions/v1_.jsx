// Step 1: Vanilla Leaflet with Dynamic CDN Script Loading & Inline Styles
// Concept Taught: Imperative DOM Manipulation, useRef, useEffect, and CDN script injection in React.

import React, { useEffect, useRef, useState } from "react";

const V1_Map = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preset location coordinates (12.909477° N, 77.566833° E)
  const latitude = 12.909477;
  const longitude = 77.566833;

  useEffect(() => {
    // 1. Inject Leaflet CSS dynamically if not present
    const cssId = "leaflet-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // 2. Inject Leaflet JS dynamically if not present
    const jsId = "leaflet-js";
    if (window.L) {
      setIsLoaded(true);
    } else if (!document.getElementById(jsId)) {
      const script = document.createElement("script");
      script.id = jsId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setIsLoaded(true);
      document.body.appendChild(script);
    } else {
      const existingScript = document.getElementById(jsId);
      const handleLoad = () => setIsLoaded(true);
      existingScript.addEventListener("load", handleLoad);
      return () => existingScript.removeEventListener("load", handleLoad);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = window.L;

    // Initialize Leaflet map centered at preset location
    const map = L.map(mapContainerRef.current).setView([latitude, longitude], 15);
    mapInstanceRef.current = map;

    // Add OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add Marker at preset coordinates with a popup
    const marker = L.marker([latitude, longitude]).addTo(map);
    marker
      .bindPopup(
        `<b>Preset Location</b><br />Latitude: ${latitude}° N<br />Longitude: ${longitude}° E`
      )
      .openPopup();

    // Cleanup map instance on unmount to prevent duplicate container initialization errors
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLoaded]);

  return (
    <div style={{ padding: "16px", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: "8px" }}>V1: Vanilla Leaflet Map (CDN Loading)</h2>
      <p style={{ marginBottom: "12px", color: "#555" }}>
        <strong>Preset Location:</strong> {latitude}° N, {longitude}° E
      </p>
      {!isLoaded && <p>Loading map assets...</p>}
      <div
        ref={mapContainerRef}
        style={{
          height: "450px",
          width: "100%",
          borderRadius: "8px",
          border: "1px solid #ccc",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
};

export default V1_Map;
