// Step 8: Real-Time Live GPS Navigation & Dynamic Path Erasing (No Fake Timers)
// Concept Taught: Live Geolocation Watcher, Closest Point Projection, Real-Time Path Trimming as User Physically Moves.

import React, { useEffect, useState } from "react";
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

// Calculate Euclidean distance between two lat/lng points
const getDistance = (p1, p2) => {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
};

// Subcomponent to listen for click events on the map to set Destination
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

const V8_Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(0);
  const [heading, setHeading] = useState(0);
  const [destination, setDestination] = useState([12.907584102477102, 77.56572887725824]); // Default CSE Block

  const [fullRoadPath, setFullRoadPath] = useState([]);
  const [remainingPath, setRemainingPath] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSecureOrigin, setIsSecureOrigin] = useState(true);

  // 1. Live Geolocation Watcher (Real GPS Updates, No Fake Timers)
  useEffect(() => {
    if (window.isSecureContext === false) {
      setIsSecureOrigin(false);
      setErrorMsg("Geolocation requires HTTPS or http://localhost:5174");
      setUserLocation([12.909477, 77.566833]); // Fallback
      return;
    }

    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      setUserLocation([12.909477, 77.566833]); // Fallback
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc, heading: gpsHeading } = position.coords;
        const currentPos = [latitude, longitude];
        setUserLocation(currentPos);
        setAccuracy(acc);

        if (gpsHeading !== null && !isNaN(gpsHeading)) {
          setHeading(gpsHeading);
        }
      },
      (err) => {
        console.warn("Geolocation watch error:", err.message);
        setErrorMsg(`Location Notice: ${err.message}. Using current preset location.`);
        if (!userLocation) setUserLocation([12.909477, 77.566833]);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 2. Web Device Orientation API: Physical Compass Heading Rotation
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

  // 3. Fetch OSRM Road Route whenever userLocation or destination changes
  useEffect(() => {
    if (!userLocation || !destination) return;

    const fetchRoadRoute = async () => {
      try {
        setLoadingRoute(true);
        const startLngLat = `${userLocation[1]},${userLocation[0]}`;
        const endLngLat = `${destination[1]},${destination[0]}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${startLngLat};${endLngLat}?overview=full&geometries=geojson`;

        const response = await axios.get(url);

        if (response.data?.routes?.[0]?.geometry?.coordinates) {
          const coords = response.data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );
          setFullRoadPath(coords);
        } else {
          setFullRoadPath([userLocation, destination]);
        }
      } catch (error) {
        console.error("Failed to fetch road route from OSRM:", error);
        setFullRoadPath([userLocation, destination]);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoadRoute();
  }, [destination]);

  // 4. Real-time Path Erasing based on Live User GPS Position
  useEffect(() => {
    if (!userLocation || fullRoadPath.length === 0) return;

    // Find the closest point index in fullRoadPath to the live userLocation
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < fullRoadPath.length; i++) {
      const dist = getDistance(userLocation, fullRoadPath[i]);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    // Remaining path ahead of the user = current live GPS location + upcoming road points
    const upcomingPoints = fullRoadPath.slice(closestIndex + 1);
    setRemainingPath([userLocation, ...upcomingPoints]);
  }, [userLocation, fullRoadPath]);

  const currentCompassHeading = Math.round((heading % 360 + 360) % 360);

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
            V8: Pure Real-Time GPS Navigation & Path Erasing
          </h2>
          <p className="text-sm text-gray-600">
            {userLocation ? (
              <>
                <span className="font-semibold text-gray-700">Live GPS:</span>{" "}
                {userLocation[0].toFixed(6)}° N, {userLocation[1].toFixed(6)}° E |{" "}
                <span className="font-semibold text-gray-700">Compass:</span> {currentCompassHeading}°
              </>
            ) : (
              <span className="animate-pulse text-blue-600 font-medium">
                Acquiring live GPS location...
              </span>
            )}
          </p>
          <p className="text-xs text-blue-600 mt-1 font-medium">
            💡 Tap anywhere on the map to change destination. As you physically move, the path erases behind you!
          </p>
        </div>

        {/* Manual Location Step Simulator for Desktop Testing without physically walking */}
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 border border-gray-200 shadow-sm">
          <label className="text-xs font-semibold text-gray-700">Desktop Step Simulator:</label>
          <button
            onClick={() => {
              if (remainingPath.length > 1) {
                const nextPoint = remainingPath[1];
                setUserLocation(nextPoint);
              }
            }}
            disabled={remainingPath.length <= 1}
            className="rounded bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            Step Forward 🚶‍♂️
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[480px] w-full overflow-hidden rounded-xl border border-gray-300 shadow-md relative">
        {userLocation ? (
          <MapContainer
            center={userLocation}
            zoom={17}
            scrollWheelZoom={true}
            className="h-full w-full cursor-crosshair"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Recenter Map dynamically on live user location update */}
            <RecenterMap location={userLocation} />

            {/* Map click listener to pick destination */}
            <MapClickHandler onSelectDestination={(pos) => setDestination(pos)} />

            {/* Accuracy Circle */}
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

            {/* Live Rotatable Navigation Arrow Marker at User's Exact Physical Position */}
            <Marker position={userLocation} icon={createArrowIcon(currentCompassHeading)}>
              <Popup>
                <div className="text-xs font-sans">
                  <strong className="text-sm font-semibold text-blue-600">Your Live GPS Location</strong>
                  <br />
                  Lat: {userLocation[0].toFixed(6)}
                  <br />
                  Lng: {userLocation[1].toFixed(6)}
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
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gray-100 text-gray-500 font-medium">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-2"></div>
            Fetching live GPS coordinates...
          </div>
        )}

        {loadingRoute && (
          <div className="absolute top-3 right-3 z-[1000] rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-md backdrop-blur-sm animate-pulse">
            Calculating live road route...
          </div>
        )}
      </div>
    </div>
  );
};

export default V8_Map;
