// Step 5: Animated Arrow Navigation & Real-time Path Erasing (Current Version)
// Concept Taught: Vector Bearing Math (atan2), Euclidean LERP, requestAnimationFrame (60 FPS), Time Progress, and Dynamic Path Trimming.

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
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

// Helper function to create a dynamically rotated navigation arrow icon
const createArrowIcon = (heading) => {
  return L.divIcon({
    className: "custom-arrow-icon",
    html: `
      <div style="transform: rotate(${heading}deg); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#2563EB" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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

const V5_Map = () => {
  // Location coordinates
  const locationA = [12.909477, 77.566833]; // Starting Location (Location A)
  const locationB = [12.907584102477102, 77.56572887725824]; // Destination: CSE Block (Location B)

  const [fullRoadPath, setFullRoadPath] = useState([]);
  const [remainingPath, setRemainingPath] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(locationA);
  const [arrowHeading, setArrowHeading] = useState(0);
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [isMoving, setIsMoving] = useState(false);

  const animRef = useRef(null);

  // Fallback street path following campus road turns if OSRM is unreachable
  const fallbackRoadPath = [
    [12.909477, 77.566833],
    [12.908800, 77.566800],
    [12.908000, 77.566200],
    [12.907584102477102, 77.56572887725824],
  ];

  // Fetch OSRM Road Route
  useEffect(() => {
    const fetchRoadRoute = async () => {
      try {
        setLoadingRoute(true);
        // OSRM Routing API expects [longitude, latitude]
        const startLngLat = `${locationA[1]},${locationA[0]}`;
        const endLngLat = `${locationB[1]},${locationB[0]}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${startLngLat};${endLngLat}?overview=full&geometries=geojson`;

        const response = await axios.get(url);

        if (response.data?.routes?.[0]?.geometry?.coordinates) {
          // Convert OSRM GeoJSON [lng, lat] format to Leaflet [lat, lng] format
          const coords = response.data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );
          setFullRoadPath(coords);
          setRemainingPath(coords);
        } else {
          setFullRoadPath(fallbackRoadPath);
          setRemainingPath(fallbackRoadPath);
        }
      } catch (error) {
        console.error("Failed to fetch road route from OSRM:", error);
        setFullRoadPath(fallbackRoadPath);
        setRemainingPath(fallbackRoadPath);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoadRoute();
  }, []);

  // Function to run a smooth animation along the road path
  const startMovementAnimation = () => {
    if (fullRoadPath.length < 2) return;

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }

    setIsMoving(true);

    // Compute cumulative segment distances along the road path
    const distances = [];
    let totalDist = 0;
    for (let i = 0; i < fullRoadPath.length - 1; i++) {
      const d = getDistance(fullRoadPath[i], fullRoadPath[i + 1]);
      distances.push(d);
      totalDist += d;
    }

    const DURATION = 30000; // 30 seconds animation duration
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1); // Clamp between 0 and 1

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

      // Interpolate current exact lat/lng position
      const currLat = p1[0] + segProgress * (p2[0] - p1[0]);
      const currLng = p1[1] + segProgress * (p2[1] - p1[1]);
      const currentPos = [currLat, currLng];

      // Calculate arrow heading direction
      const heading = getHeading(p1, p2);

      setCurrentPosition(currentPos);
      setArrowHeading(heading);

      // Erase path behind the arrow: remaining path is current position + upcoming road points
      const upcomingPoints = fullRoadPath.slice(segmentIndex + 1);
      setRemainingPath([currentPos, ...upcomingPoints]);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsMoving(false);
        setRemainingPath([]);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  // Trigger animation once route finishes loading
  useEffect(() => {
    if (fullRoadPath.length >= 2 && !loadingRoute) {
      startMovementAnimation();
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [fullRoadPath, loadingRoute]);

  return (
    <div className="p-4 font-sans">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            V5: Animated Navigation & Real-time Path Erasing
          </h2>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-700">Start (A):</span> 12.909477° N, 77.566833° E |{" "}
            <span className="font-semibold text-gray-700">CSE Block (B):</span> 12.907584° N, 77.565728° E
          </p>
        </div>
        <button
          onClick={startMovementAnimation}
          disabled={isMoving || loadingRoute}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isMoving ? "Navigating..." : "Replay Navigation"}
        </button>
      </div>

      {/* Map Container */}
      <div className="h-[480px] w-full overflow-hidden rounded-xl border border-gray-300 shadow-md">
        <MapContainer
          center={locationA}
          zoom={17}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marker 1: Location A */}
          <Marker position={locationA}>
            <Popup>
              <div className="text-xs font-sans">
                <strong className="text-sm font-semibold text-blue-600">Location A (Start)</strong>
              </div>
            </Popup>
          </Marker>

          {/* Marker 2: Location B (CSE Block) */}
          <Marker position={locationB}>
            <Popup>
              <div className="text-xs font-sans">
                <strong className="text-sm font-semibold text-red-600">CSE Block (Destination)</strong>
              </div>
            </Popup>
          </Marker>

          {/* Moving Navigation Arrow Marker */}
          <Marker position={currentPosition} icon={createArrowIcon(arrowHeading)}>
            <Popup>
              <div className="text-xs font-sans">
                <strong className="text-sm font-semibold text-blue-600">Navigation Arrow</strong>
              </div>
            </Popup>
          </Marker>

          {/* Blue Path Line that ERASES behind the moving arrow */}
          {remainingPath.length > 1 && (
            <Polyline
              positions={remainingPath}
              pathOptions={{
                color: "#2563EB",
                weight: 6,
                opacity: 0.85,
                lineJoin: "round",
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default V5_Map;
