// Step 6: Real-Time User Geolocation & Compass Heading Rotation
// Concept Taught: Web Geolocation API (watchPosition), Device Orientation API (deviceorientation), Dynamic Map Centering (useMap), Real-Time SVG Marker Rotation.

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons missing in Vite / React bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Helper function to create dynamically rotated navigation arrow icon
const createArrowIcon = (heading) => {
  return L.divIcon({
    className: "custom-arrow-icon",
    html: `
      <div style="transform: rotate(${heading}deg); width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0px 2px 5px rgba(0,0,0,0.3));">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#2563EB" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Subcomponent to dynamically re-center map when user location updates
const RecenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, map.getZoom());
    }
  }, [location, map]);
  return null;
};

const V6_Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(0);
  const [heading, setHeading] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSecureOrigin, setIsSecureOrigin] = useState(true);
  const [isLocating, setIsLocating] = useState(false);

  // Core function to trigger mobile native location permission dialog on user gesture
  const requestLocation = (highAccuracy = true) => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      setUserLocation([12.909477, 77.566833]); // Fallback
      return;
    }

    setIsLocating(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc, heading: gpsHeading } = position.coords;
        setUserLocation([latitude, longitude]);
        setAccuracy(acc);
        setIsLocating(false);
        if (gpsHeading !== null && !isNaN(gpsHeading)) setHeading(gpsHeading);

        // Start continuous position tracking
        navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude: lat, longitude: lng, accuracy: a, heading: h } = pos.coords;
            setUserLocation([lat, lng]);
            setAccuracy(a);
            if (h !== null && !isNaN(h)) setHeading(h);
          },
          (err) => console.warn("Watch position update error:", err.message),
          { enableHighAccuracy: highAccuracy, maximumAge: 5000 }
        );
      },
      (err) => {
        console.warn(`Geolocation error (highAccuracy=${highAccuracy}):`, err.message);
        if (highAccuracy) {
          // Retry with low accuracy (Wi-Fi/cell tower) if high accuracy times out
          requestLocation(false);
        } else {
          setIsLocating(false);
          setErrorMsg(`Location Error: ${err.message}. Tap 'Enable Location' button to trigger prompt.`);
          setUserLocation([12.909477, 77.566833]); // Fallback
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 5000 : 10000,
        maximumAge: 0,
      }
    );
  };

  // 1. Initial Attempt on Mount
  useEffect(() => {
    if (window.isSecureContext === false) {
      setIsSecureOrigin(false);
      setErrorMsg("Browser blocks Geolocation on non-secure HTTP (IP address). Open via https://localhost:5174 or HTTPS!");
      setUserLocation([12.909477, 77.566833]);
      return;
    }

    requestLocation(true);
  }, []);

  // 2. Web Device Orientation API: Track physical compass rotation (Magnetometer / Gyroscope)
  useEffect(() => {
    const handleOrientation = (event) => {
      // iOS Safari Compass Heading
      if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
        setHeading(event.webkitCompassHeading);
      }
      // Standard Android / Chrome Compass Heading
      else if (event.alpha !== null && event.alpha !== undefined) {
        setHeading(360 - event.alpha);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", handleOrientation, true);
      }
    };
  }, []);

  const currentCompassHeading = Math.round((heading % 360 + 360) % 360);

  return (
    <div className="p-4 font-sans">
      {!isSecureOrigin && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 border border-amber-200 text-amber-800 text-xs font-medium">
          ⚠️ <strong>Security Notice:</strong> Browsers require a secure connection (`localhost` or `HTTPS`) to access GPS Geolocation.
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            V6: Live User Geolocation & Compass Rotation
          </h2>
          <p className="text-sm text-gray-600">
            {userLocation ? (
              <>
                <span className="font-semibold text-gray-700">Coordinates:</span>{" "}
                {userLocation[0].toFixed(6)}° N, {userLocation[1].toFixed(6)}° E |{" "}
                <span className="font-semibold text-gray-700">Heading:</span> {currentCompassHeading}° |{" "}
                <span className="font-semibold text-gray-700">Accuracy:</span> ±{Math.round(accuracy)}m
              </>
            ) : (
              <span className="animate-pulse text-blue-600 font-semibold">
                Acquiring GPS / Wi-Fi location...
              </span>
            )}
          </p>
          {errorMsg && <p className="mt-1 text-xs text-red-500 font-medium">{errorMsg}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Explicit User Button to Trigger Mobile Native Permission Dialog */}
          <button
            onClick={() => requestLocation(true)}
            disabled={isLocating}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
            {isLocating ? "Locating..." : "📍 Enable Live GPS Location"}
          </button>

          {/* Manual Compass Slider for Desktop/Laptop Testing */}
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1.5 border border-gray-200 shadow-sm">
            <label className="text-xs font-semibold text-gray-700">Rotate:</label>
            <input
              type="range"
              min="0"
              max="360"
              value={currentCompassHeading}
              onChange={(e) => setHeading(Number(e.target.value))}
              className="w-24 cursor-pointer accent-blue-600"
            />
            <span className="w-8 text-xs font-bold text-gray-800">{currentCompassHeading}°</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[480px] w-full overflow-hidden rounded-xl border border-gray-300 shadow-md">
        {userLocation ? (
          <MapContainer
            center={userLocation}
            zoom={17}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Recenter Map dynamically on GPS update */}
            <RecenterMap location={userLocation} />

            {/* Accuracy Circle around User */}
            {accuracy > 0 && (
              <Circle
                center={userLocation}
                radius={accuracy}
                pathOptions={{
                  color: "#3B82F6",
                  fillColor: "#60A5FA",
                  fillOpacity: 0.15,
                  weight: 1,
                }}
              />
            )}

            {/* Live Rotatable User Location Arrow */}
            <Marker position={userLocation} icon={createArrowIcon(currentCompassHeading)}>
              <Popup>
                <div className="text-xs font-sans">
                  <strong className="text-sm font-semibold text-blue-600">Your Real-Time Location</strong>
                  <br />
                  Lat: {userLocation[0].toFixed(6)}
                  <br />
                  Lng: {userLocation[1].toFixed(6)}
                  <br />
                  Compass Heading: {currentCompassHeading}°
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gray-100 text-gray-500 font-medium">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-2"></div>
            <p className="mb-3 text-sm">Waiting for location permission...</p>
            <button
              onClick={() => requestLocation(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
            >
              📍 Tap to Allow Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default V6_Map;
