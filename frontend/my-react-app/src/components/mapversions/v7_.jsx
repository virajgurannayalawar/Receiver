// Step 7: Interactive Destination Picker, OSRM Road Routing & Animated Path Erasing
// Concept Taught: Map Click Events (useMapEvents), Dynamic Waypoint Navigation, OSRM Routing, 60 FPS Animation, Real-Time Path Trimming.

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

// Calculate Euclidean distance between two lat/lng coordinates
const getDistance = (p1, p2) => {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
};

// Calculate rotation angle (heading) in degrees between two coordinates
const getHeading = (p1, p2) => {
  const dLat = p2[0] - p1[0];
  const dLng = p2[1] - p1[1];
  return Math.atan2(dLng, dLat) * (180 / Math.PI);
};

// Subcomponent to listen for click events on the map to choose Destination
const MapClickHandler = ({ onSelectDestination }) => {
  useMapEvents({
    click(e) {
      onSelectDestination([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

// Subcomponent to dynamically re-center map
const RecenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, map.getZoom());
    }
  }, [location, map]);
  return null;
};

const V7_Map = () => {
  // Default start location (Location A)
  const [userLocation, setUserLocation] = useState([12.909477, 77.566833]);
  const [destination, setDestination] = useState([12.907584102477102, 77.56572887725824]); // Default CSE Block

  const [fullRoadPath, setFullRoadPath] = useState([]);
  const [remainingPath, setRemainingPath] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(userLocation);
  const [arrowHeading, setArrowHeading] = useState(0);

  const [loadingRoute, setLoadingRoute] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSecureOrigin, setIsSecureOrigin] = useState(true);

  const animRef = useRef(null);

  // Fetch OSRM Road Route whenever userLocation or destination changes
  useEffect(() => {
    if (!userLocation || !destination) return;

    const fetchRoadRoute = async () => {
      try {
        setLoadingRoute(true);
        // OSRM Routing API expects [longitude, latitude]
        const startLngLat = `${userLocation[1]},${userLocation[0]}`;
        const endLngLat = `${destination[1]},${destination[0]}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${startLngLat};${endLngLat}?overview=full&geometries=geojson`;

        const response = await axios.get(url);

        if (response.data?.routes?.[0]?.geometry?.coordinates) {
          // Convert OSRM GeoJSON [lng, lat] format to Leaflet [lat, lng] format
          const coords = response.data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );
          setFullRoadPath(coords);
          setRemainingPath(coords);
          setCurrentPosition(coords[0] || userLocation);
        } else {
          // Fallback straight segment if routing fails
          const fallback = [userLocation, destination];
          setFullRoadPath(fallback);
          setRemainingPath(fallback);
          setCurrentPosition(userLocation);
        }
      } catch (error) {
        console.error("Failed to fetch road route from OSRM:", error);
        const fallback = [userLocation, destination];
        setFullRoadPath(fallback);
        setRemainingPath(fallback);
        setCurrentPosition(userLocation);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoadRoute();
  }, [userLocation, destination]);

  // Request user live GPS location on mount / button click
  const requestLocation = () => {
    if (window.isSecureContext === false) {
      setIsSecureOrigin(false);
      setErrorMsg("Geolocation requires HTTPS or http://localhost:5174");
      return;
    }

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setCurrentPosition(coords);
      },
      (err) => console.warn("GPS location error:", err.message),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Function to start V5 60 FPS animation & real-time path erasing
  const startNavigation = () => {
    if (fullRoadPath.length < 2) return;

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }

    setIsNavigating(true);

    // Compute cumulative segment distances along the road path
    const distances = [];
    let totalDist = 0;
    for (let i = 0; i < fullRoadPath.length - 1; i++) {
      const d = getDistance(fullRoadPath[i], fullRoadPath[i + 1]);
      distances.push(d);
      totalDist += d;
    }

    const DURATION = 15000; // 15 seconds navigation duration
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1); // Clamp 0 to 1

      const targetDist = progress * totalDist;

      // Find current road segment based on distance covered
      let accumulated = 0;
      let segmentIndex = 0;
      for (let i = 0; i < distances.length; i++) {
        if (accumulated + distances[i] >= targetDist) {
          segmentIndex = i;
          break;
        }
        accumulated += distances[i];
      }

      if (segmentIndex >= distances.length) {
        segmentIndex = distances.length - 1;
      }

      const p1 = fullRoadPath[segmentIndex];
      const p2 = fullRoadPath[segmentIndex + 1] || p1;
      const segDist = distances[segmentIndex] || 1;
      const segProgress = Math.max(0, Math.min((targetDist - accumulated) / segDist, 1));

      // LERP current exact position
      const currLat = p1[0] + segProgress * (p2[0] - p1[0]);
      const currLng = p1[1] + segProgress * (p2[1] - p1[1]);
      const currentPos = [currLat, currLng];

      // Calculate arrow heading direction
      const heading = getHeading(p1, p2);

      setCurrentPosition(currentPos);
      setArrowHeading(heading);

      // ERASE PATH BEHIND: remaining path is current position + upcoming road points
      const upcomingPoints = fullRoadPath.slice(segmentIndex + 1);
      setRemainingPath([currentPos, ...upcomingPoints]);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsNavigating(false);
        setRemainingPath([]);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="p-4 font-sans">
      {!isSecureOrigin && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 border border-amber-200 text-amber-800 text-xs font-medium">
          ⚠️ <strong>Security Notice:</strong> Geolocation requires `localhost` or `HTTPS`.
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            V7: Click Map to Set Destination & Animate Navigation
          </h2>
          <p className="text-sm text-gray-600">
            💡 <span className="font-semibold text-blue-600">Instructions:</span> Click anywhere on the map to set a new destination, then tap <strong>Start Navigation</strong>!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={startNavigation}
            disabled={isNavigating || loadingRoute || fullRoadPath.length < 2}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            {isNavigating ? "Navigating (15s)..." : "Start Animated Navigation"}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[480px] w-full overflow-hidden rounded-xl border border-gray-300 shadow-md relative">
        <MapContainer
          center={userLocation}
          zoom={16}
          scrollWheelZoom={true}
          className="h-full w-full cursor-crosshair"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Recenter Map subcomponent */}
          <RecenterMap location={userLocation} />

          {/* Click Handler to pick new destination */}
          <MapClickHandler onSelectDestination={(pos) => setDestination(pos)} />

          {/* Start Point Marker (Location A) */}
          <Marker position={userLocation}>
            <Popup>
              <div className="text-xs font-sans">
                <strong className="text-sm font-semibold text-blue-600">Start Location (Point A)</strong>
              </div>
            </Popup>
          </Marker>

          {/* Selected Destination Marker (Location B) */}
          {destination && (
            <Marker position={destination}>
              <Popup>
                <div className="text-xs font-sans">
                  <strong className="text-sm font-semibold text-red-600">Selected Destination (Point B)</strong>
                  <br />
                  Lat: {destination[0].toFixed(6)}
                  <br />
                  Lng: {destination[1].toFixed(6)}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Moving Navigation Arrow Marker */}
          {isNavigating && (
            <Marker position={currentPosition} icon={createArrowIcon(arrowHeading)}>
              <Popup>
                <div className="text-xs font-sans">
                  <strong className="text-sm font-semibold text-blue-600">Moving Arrow Pointer</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Blue Path Line that ERASES behind the moving arrow */}
          {remainingPath.length > 1 && (
            <Polyline
              positions={remainingPath}
              pathOptions={{
                color: "#2563EB", // Vibrant Blue
                weight: 6,         // Thickness
                opacity: 0.85,
                lineJoin: "round",
              }}
            />
          )}
        </MapContainer>

        {loadingRoute && (
          <div className="absolute top-3 right-3 z-[1000] rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-md backdrop-blur-sm animate-pulse">
            Calculating road route to clicked location...
          </div>
        )}
      </div>
    </div>
  );
};

export default V7_Map;
