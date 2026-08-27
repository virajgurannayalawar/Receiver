// Step 9: Ultra-Smooth Arrow LERP Animation, Mobile Touch Gestures & Tap Destination Picker
// Concept Taught: Ease-Out Quad LERP Position Smoothing, Cubic-Bezier Rotation Transitions, Mobile Touch Gestures (1-finger pan, 2-finger pinch zoom), Tap to Select Waypoint.

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

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

// Helper function to create ultra-smooth rotated navigation arrow icon with CSS transitions
const createArrowIcon = (heading) => {
  return L.divIcon({
    className: "custom-arrow-icon",
    html: `
      <div style="transform: rotate(${heading}deg); transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1); width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.35));">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="#2563EB" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

// Calculate Euclidean distance between two lat/lng points
const getDistance = (p1, p2) => {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
};

// Subcomponent to handle tap / click events for destination selection
const MapClickHandler = ({ onSelectDestination }) => {
  useMapEvents({
    click(e) {
      onSelectDestination([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

// Subcomponent to dynamically re-center map smoothly
const RecenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.panTo(location, { animate: true, duration: 0.5 });
    }
  }, [location, map]);
  return null;
};

const V9_Map = () => {
  // Default Initial Location (Map loads INSTANTLY without waiting)
  const defaultInitialPos = [12.909477, 77.566833];

  const [userLocation, setUserLocation] = useState(defaultInitialPos); // Target position
  const [displayLocation, setDisplayLocation] = useState(defaultInitialPos); // LERP position
  const [accuracy, setAccuracy] = useState(0);
  const [heading, setHeading] = useState(0);
  const [destination, setDestination] = useState([12.907584102477102, 77.56572887725824]); // Default CSE Block

  const [fullRoadPath, setFullRoadPath] = useState([]);
  const [remainingPath, setRemainingPath] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSecureOrigin, setIsSecureOrigin] = useState(true);

  // Function to request user location with high->low accuracy fallback
  const requestLocation = (highAccuracy = true) => {
    if (window.isSecureContext === false) {
      setIsSecureOrigin(false);
      setErrorMsg("Geolocation requires HTTPS or http://localhost:5174");
      return;
    }

    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc, heading: gpsHeading } = position.coords;
        const currentPos = [latitude, longitude];
        setUserLocation(currentPos);
        setAccuracy(acc);
        setIsLocating(false);
        setErrorMsg("");
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
          { enableHighAccuracy: highAccuracy, maximumAge: 3000 }
        );
      },
      (err) => {
        console.warn(`Geolocation error (highAccuracy=${highAccuracy}):`, err.message);
        if (highAccuracy) {
          // Retry with low accuracy (Wi-Fi / Cell tower triangulation)
          requestLocation(false);
        } else {
          setIsLocating(false);
          setErrorMsg(`Location Error: ${err.message}. Tap '📍 Locate Me' button to retry.`);
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 3500 : 8000,
        maximumAge: 0,
      }
    );
  };

  // 1. Initial Attempt on Mount
  useEffect(() => {
    requestLocation(true);
  }, []);

  // 2. Smooth 60 FPS LERP Interpolation for Position Movements
  useEffect(() => {
    if (!userLocation) return;
    if (!displayLocation) {
      setDisplayLocation(userLocation);
      return;
    }

    let animationFrameId;
    const startPos = displayLocation;
    const targetPos = userLocation;
    const startTime = performance.now();
    const DURATION = 450; // 450ms fluid transition between GPS ticks

    const smoothStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease-Out Quad formula: 1 - (1 - t)^2
      const easeProgress = 1 - (1 - progress) * (1 - progress);

      const lat = startPos[0] + (targetPos[0] - startPos[0]) * easeProgress;
      const lng = startPos[1] + (targetPos[1] - startPos[1]) * easeProgress;

      setDisplayLocation([lat, lng]);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(smoothStep);
      }
    };

    animationFrameId = requestAnimationFrame(smoothStep);
    return () => cancelAnimationFrame(animationFrameId);
  }, [userLocation]);

  // 3. Web Device Orientation API: Physical Compass Heading Rotation
  useEffect(() => {
    const handleOrientation = (event) => {
      if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
        setHeading(event.webkitCompassHeading);
      } else if (event.alpha !== null && event.alpha !== undefined) {
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

  // 4. Fetch OSRM Road Route whenever displayLocation or destination changes
  useEffect(() => {
    const startPos = displayLocation || userLocation;
    if (!startPos || !destination) return;

    const fetchRoadRoute = async () => {
      try {
        setLoadingRoute(true);
        const startLngLat = `${startPos[1]},${startPos[0]}`;
        const endLngLat = `${destination[1]},${destination[0]}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${startLngLat};${endLngLat}?overview=full&geometries=geojson`;

        const response = await axios.get(url);

        if (response.data?.routes?.[0]?.geometry?.coordinates) {
          const coords = response.data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );
          setFullRoadPath(coords);
        } else {
          setFullRoadPath([startPos, destination]);
        }
      } catch (error) {
        console.error("Failed to fetch road route from OSRM:", error);
        setFullRoadPath([startPos, destination]);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoadRoute();
  }, [destination]);

  // 5. Real-time Path Erasing based on Smoothed Display Position
  useEffect(() => {
    const currentPos = displayLocation || userLocation;
    if (!currentPos || fullRoadPath.length === 0) return;

    // Find the closest point index in fullRoadPath to currentPos
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < fullRoadPath.length; i++) {
      const dist = getDistance(currentPos, fullRoadPath[i]);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    // Remaining path ahead = currentPos + upcoming road points
    const upcomingPoints = fullRoadPath.slice(closestIndex + 1);
    setRemainingPath([currentPos, ...upcomingPoints]);
  }, [displayLocation, fullRoadPath]);

  const currentCompassHeading = Math.round((heading % 360 + 360) % 360);

  return (
    <div className="p-4 font-sans select-none">
      {!isSecureOrigin && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 border border-amber-200 text-amber-800 text-xs font-medium">
          ⚠️ <strong>Security Notice:</strong> Geolocation requires `localhost` or `HTTPS`.
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            V9: Smooth Arrow LERP, Mobile Gestures & Tap Picker
          </h2>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-700">Location:</span>{" "}
            {displayLocation[0].toFixed(6)}° N, {displayLocation[1].toFixed(6)}° E |{" "}
            <span className="font-semibold text-gray-700">Compass:</span> {currentCompassHeading}°
          </p>
          {errorMsg && <p className="mt-1 text-xs text-red-500 font-medium">{errorMsg}</p>}
          <p className="text-xs text-blue-600 mt-1 font-medium">
            📱 <strong>Mobile Gestures:</strong> 1 Finger to Pan | 2 Fingers to Pinch Zoom | Single Tap to Pick Destination
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direct User Gesture Button for Mobile Location Request */}
          <button
            onClick={() => requestLocation(true)}
            disabled={isLocating}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
            {isLocating ? "Locating..." : "📍 Locate Me"}
          </button>

          {/* Step Forward Simulator for Desktop Testing */}
          <button
            onClick={() => {
              if (remainingPath.length > 1) {
                const nextPoint = remainingPath[1];
                setUserLocation(nextPoint);
              }
            }}
            disabled={remainingPath.length <= 1}
            className="rounded bg-gray-100 p-2 text-xs font-bold text-gray-800 border border-gray-200 shadow-sm hover:bg-gray-200 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            Step Forward 🚶‍♂️
          </button>
        </div>
      </div>

      {/* Map Container with Native Mobile Gestures (1 finger pan, 2 finger pinch zoom) */}
      <div className="h-[480px] w-full overflow-hidden rounded-xl border border-gray-300 shadow-md relative">
        <MapContainer
          center={displayLocation}
          zoom={17}
          dragging={true}         // 1 finger pan on mobile
          touchZoom={true}       // 2 finger pinch zoom on mobile
          doubleClickZoom={true}
          scrollWheelZoom={true}
          zoomControl={true}
          className="h-full w-full cursor-crosshair"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Recenter Map dynamically on smooth location update */}
          <RecenterMap location={displayLocation} />

          {/* Single Tap Handler for picking Destination */}
          <MapClickHandler onSelectDestination={(pos) => setDestination(pos)} />

          {/* Accuracy Circle */}
          {accuracy > 0 && (
            <Circle
              center={displayLocation}
              radius={accuracy}
              pathOptions={{
                color: "#3B82F6",
                fillColor: "#60A5FA",
                fillOpacity: 0.15,
                weight: 1,
              }}
            />
          )}

          {/* Smoothly Animated & Rotated Navigation Arrow Marker */}
          <Marker position={displayLocation} icon={createArrowIcon(currentCompassHeading)}>
            <Popup>
              <div className="text-xs font-sans">
                <strong className="text-sm font-semibold text-blue-600">Smoothed GPS Position</strong>
                <br />
                Lat: {displayLocation[0].toFixed(6)}
                <br />
                Lng: {displayLocation[1].toFixed(6)}
                <br />
                Compass Heading: {currentCompassHeading}°
              </div>
            </Popup>
          </Marker>

          {/* Selected Destination Marker */}
          {destination && (
            <Marker position={destination}>
              <Popup>
                <div className="text-xs font-sans">
                  <strong className="text-sm font-semibold text-red-600">Selected Destination</strong>
                  <br />
                  Lat: {destination[0].toFixed(6)}
                  <br />
                  Lng: {destination[1].toFixed(6)}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Blue Path Line Ahead of User (Erases Behind as User Moves) */}
          {remainingPath.length > 1 && (
            <Polyline
              positions={remainingPath}
              pathOptions={{
                color: "#2563EB", // Vibrant Blue
                weight: 6,         // Line thickness
                opacity: 0.85,
                lineJoin: "round",
              }}
            />
          )}
        </MapContainer>

        {loadingRoute && (
          <div className="absolute top-3 right-3 z-[1000] rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-md backdrop-blur-sm animate-pulse">
            Calculating road route...
          </div>
        )}
      </div>
    </div>
  );
};

export default V9_Map;
