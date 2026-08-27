// Step 10: Complete DSI Campus Landmark Markers with Suitable SVG Icons & Category Styling
// Concept Taught: Spatial Landmark Datasets, Custom Leaflet SVG DivIcons, Category Filtering, and Click-to-Navigate Waypoint Selection.

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

// Helper function to create custom landmark icons with category colors & SVG paths
const createLandmarkIcon = (svgPath, bgColor = "#3B82F6") => {
  return L.divIcon({
    className: "custom-landmark-icon",
    html: `
      <div style="background-color: ${bgColor}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0px 2px 6px rgba(0,0,0,0.3); color: #ffffff;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          ${svgPath}
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// User Live Navigation Arrow Icon
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

// 27 Campus Landmarks Dataset with Suitable SVG Icons & Category Colors
const CAMPUS_LANDMARKS = [
  {
    id: "dsi_library",
    name: "DSI Library",
    category: "Academic",
    coords: [12.909230189235593, 77.56716280659134],
    bgColor: "#2563EB", // Blue
    svg: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>`,
  },
  {
    id: "auditorium",
    name: "PC Sagar Auditorium",
    category: "Arts & Events",
    coords: [12.90894428356394, 77.56724342173918],
    bgColor: "#DC2626", // Red
    svg: `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line>`,
  },
  {
    id: "heritage_block",
    name: "Heritage Block",
    category: "Administration",
    coords: [12.908956002015728, 77.56642327575278],
    bgColor: "#7C3AED", // Purple
    svg: `<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="6" x2="9.01" y2="6"></line><line x1="15" y1="6" x2="15.01" y2="6"></line><line x1="9" y1="10" x2="9.01" y2="10"></line><line x1="15" y1="10" x2="15.01" y2="10"></line><line x1="9" y1="14" x2="9.01" y2="14"></line><line x1="15" y1="14" x2="15.01" y2="14"></line>`,
  },
  {
    id: "temple",
    name: "Shavige Malleshwara Temple",
    category: "Spiritual",
    coords: [12.908496944143122, 77.56656818348584],
    bgColor: "#D97706", // Amber
    svg: `<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>`,
  },
  {
    id: "canteen",
    name: "Canteen",
    category: "Dining",
    coords: [12.908330137841688, 77.56629874121339],
    bgColor: "#059669", // Emerald
    svg: `<path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line>`,
  },
  {
    id: "indian_mess",
    name: "Indian Mess",
    category: "Dining",
    coords: [12.908430311505892, 77.56646481397337],
    bgColor: "#10B981", // Green
    svg: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
  },
  {
    id: "spiritual_building",
    name: "Spiritual Building",
    category: "Spiritual",
    coords: [12.90836681881537, 77.5667391209061],
    bgColor: "#F59E0B", // Amber Gold
    svg: `<circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8"></path>`,
  },
  {
    id: "girls_hostel",
    name: "Girls Hostel",
    category: "Residential",
    coords: [12.907646674062565, 77.56646973531326],
    bgColor: "#EC4899", // Pink
    svg: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>`,
  },
  {
    id: "nri_hostel",
    name: "NRI Hostel",
    category: "Residential",
    coords: [12.90705086462201, 77.56745911433956],
    bgColor: "#F43F5E", // Rose
    svg: `<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>`,
  },
  {
    id: "new_cse_building",
    name: "New CSE Building",
    category: "Department",
    coords: [12.907648352297038, 77.56598646868318],
    bgColor: "#4F46E5", // Indigo
    svg: `<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>`,
  },
  {
    id: "old_cse_building",
    name: "Old CSE Building",
    category: "Department",
    coords: [12.907946695411201, 77.56603796354176],
    bgColor: "#6366F1", // Indigo
    svg: `<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>`,
  },
  {
    id: "mca_department",
    name: "MCA Department",
    category: "Department",
    coords: [12.907391283265937, 77.56561326004898],
    bgColor: "#3B82F6", // Blue
    svg: `<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M21 19c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14e"></path><path d="M21 5v14"></path>`,
  },
  {
    id: "ece_department",
    name: "ECE Department",
    category: "Department",
    coords: [12.907643116254874, 77.56555132412295],
    bgColor: "#06B6D4", // Cyan
    svg: `<rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line>`,
  },
  {
    id: "bb_block",
    name: "BB Block",
    category: "Academic",
    coords: [12.90696240443293, 77.56625797657412],
    bgColor: "#6B7280", // Gray
    svg: `<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="16" y2="14"></line>`,
  },
  {
    id: "architecture_block",
    name: "Architecture Block",
    category: "Department",
    coords: [12.906715981663698, 77.56636535295961],
    bgColor: "#0284C7", // Sky Blue
    svg: `<polygon points="12 2 2 22 22 22 12 2"></polygon><line x1="12" y1="6" x2="12" y2="22"></line>`,
  },
  {
    id: "pu_block",
    name: "PU Block",
    category: "Academic",
    coords: [12.9063946237575, 77.56674896782359],
    bgColor: "#8B5CF6", // Violet
    svg: `<path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>`,
  },
  {
    id: "biotech_cyber_block",
    name: "Bio-Tech / Cyber Security Block",
    category: "Department",
    coords: [12.907790691351256, 77.56765974927356],
    bgColor: "#10B981", // Emerald
    svg: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>`,
  },
  {
    id: "chemical_eng_block",
    name: "Chemical Engineering Block",
    category: "Department",
    coords: [12.907911687724718, 77.56768183594541],
    bgColor: "#D97706", // Orange
    svg: `<path d="M10 2v7.31L4.19 19A2 2 0 0 0 6 22h12a2 2 0 0 0 1.81-3L14 9.31V2z"></path><line x1="8" y1="2" x2="16" y2="2"></line>`,
  },
  {
    id: "electrical_dept",
    name: "Electrical Department",
    category: "Department",
    coords: [12.908204862455552, 77.56770391113172],
    bgColor: "#EAB308", // Yellow
    svg: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>`,
  },
  {
    id: "robotics_dept",
    name: "Robotics Department",
    category: "Department",
    coords: [12.908251015307911, 77.56749662591957],
    bgColor: "#0284C7", // Cyan
    svg: `<rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="15" x2="8" y2="17"></line><line x1="16" y1="15" x2="16" y2="17"></line>`,
  },
  {
    id: "mechanical_dept",
    name: "Mechanical Department",
    category: "Department",
    coords: [12.908579463377418, 77.56770517056395],
    bgColor: "#475569", // Slate
    svg: `<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`,
  },
  {
    id: "management_dept",
    name: "Department of Management Studies",
    category: "Department",
    coords: [12.908681343336017, 77.56817706454767],
    bgColor: "#2563EB", // Blue
    svg: `<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>`,
  },
  {
    id: "automobile_eng_block",
    name: "Automobile Engineering Block",
    category: "Department",
    coords: [12.909002976730502, 77.56819983076171],
    bgColor: "#DC2626", // Red
    svg: `<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>`,
  },
  {
    id: "dental_block",
    name: "Dental Block",
    category: "Medical",
    coords: [12.908582716366663, 77.56598251279244],
    bgColor: "#0EA5E9", // Light Blue
    svg: `<path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>`,
  },
  {
    id: "cs_design_block",
    name: "CS Design Block",
    category: "Department",
    coords: [12.908267174849788, 77.56566665555131],
    bgColor: "#8B5CF6", // Purple
    svg: `<circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.71 1.7-1.63 0-.43-.17-.83-.44-1.14-.26-.3-.42-.71-.42-1.16 0-.92.71-1.7 1.63-1.7h2.07c2.98 0 5.46-2.48 5.46-5.46C22 6.46 17.5 2 12 2z"></path>`,
  },
  {
    id: "indian_boys_hostel",
    name: "Indian Boys Hostel",
    category: "Residential",
    coords: [12.90880617302034, 77.56544451324034],
    bgColor: "#3B82F6", // Blue
    svg: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>`,
  },
  {
    id: "ampitheatre",
    name: "Amphitheatre",
    category: "Arts & Events",
    coords: [12.908124316262867, 77.5661325607402],
    bgColor: "#9333EA", // Violet
    svg: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>`,
  },
];

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

const V10_Map = () => {
  const defaultInitialPos = [12.909477, 77.566833];

  const [userLocation, setUserLocation] = useState(defaultInitialPos);
  const [displayLocation, setDisplayLocation] = useState(defaultInitialPos);
  const [accuracy, setAccuracy] = useState(0);
  const [heading, setHeading] = useState(0);
  const [destination, setDestination] = useState(CAMPUS_LANDMARKS[9].coords); // Default: New CSE Building
  const [selectedLandmark, setSelectedLandmark] = useState(null);

  const [fullRoadPath, setFullRoadPath] = useState([]);
  const [remainingPath, setRemainingPath] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSecureOrigin, setIsSecureOrigin] = useState(true);

  // Request user location with high->low accuracy fallback
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
          requestLocation(false);
        } else {
          setIsLocating(false);
          setErrorMsg(`Location Notice: ${err.message}. Showing default DSI campus view.`);
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 3500 : 8000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    requestLocation(true);
  }, []);

  // Smooth 60 FPS LERP Interpolation for Position Movements
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
    const DURATION = 450;

    const smoothStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
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

  // Fetch OSRM Road Route whenever displayLocation or destination changes
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

  // Real-time Path Erasing based on Smoothed Display Position
  useEffect(() => {
    const currentPos = displayLocation || userLocation;
    if (!currentPos || fullRoadPath.length === 0) return;

    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < fullRoadPath.length; i++) {
      const dist = getDistance(currentPos, fullRoadPath[i]);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

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
            V10: DSI Campus Map with 27 Landmark Icons
          </h2>
          <p className="text-sm text-gray-600">
            Click any campus icon or map point to navigate to that building in real time!
          </p>
          {errorMsg && <p className="mt-1 text-xs text-red-500 font-medium">{errorMsg}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

      {/* Map Container */}
      <div className="h-[520px] w-full overflow-hidden rounded-xl border border-gray-300 shadow-md relative">
        <MapContainer
          center={displayLocation}
          zoom={18}
          maxZoom={22}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          zoomControl={true}
          className="h-full w-full cursor-crosshair"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={22}
            maxNativeZoom={19}
          />

          <RecenterMap location={displayLocation} />
          <MapClickHandler onSelectDestination={(pos) => setDestination(pos)} />

          {/* User Accuracy Circle */}
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

          {/* User Rotatable Arrow Marker */}
          <Marker position={displayLocation} icon={createArrowIcon(currentCompassHeading)}>
            <Popup>
              <div className="text-xs font-sans">
                <strong className="text-sm font-semibold text-blue-600">Your Live GPS Location</strong>
              </div>
            </Popup>
          </Marker>

          {/* Render All 27 DSI Campus Landmarks */}
          {CAMPUS_LANDMARKS.map((landmark) => (
            <Marker
              key={landmark.id}
              position={landmark.coords}
              icon={createLandmarkIcon(landmark.svg, landmark.bgColor)}
              eventHandlers={{
                click: () => {
                  setDestination(landmark.coords);
                  setSelectedLandmark(landmark);
                },
              }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs min-w-[160px]">
                  <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 mb-1">
                    {landmark.category}
                  </span>
                  <strong className="block text-sm font-bold text-gray-900 mb-1">
                    {landmark.name}
                  </strong>
                  <button
                    onClick={() => setDestination(landmark.coords)}
                    className="w-full mt-2 rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow hover:bg-blue-700 cursor-pointer"
                  >
                    🚀 Navigate Here
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Selected Custom Destination Marker if clicked on map outside landmarks */}
          {destination && !CAMPUS_LANDMARKS.some((l) => l.coords[0] === destination[0] && l.coords[1] === destination[1]) && (
            <Marker position={destination}>
              <Popup>
                <div className="text-xs font-sans">
                  <strong className="text-sm font-semibold text-red-600">Custom Destination</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Blue Path Line Ahead of User */}
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

        {loadingRoute && (
          <div className="absolute top-3 right-3 z-[1000] rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-md backdrop-blur-sm animate-pulse">
            Calculating campus road route...
          </div>
        )}
      </div>
    </div>
  );
};

export default V10_Map;
