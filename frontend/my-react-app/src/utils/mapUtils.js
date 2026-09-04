import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default marker icons missing in Vite / React bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Helper function to create custom landmark icons with category colors & SVG paths
export const createLandmarkIcon = (svgPath, bgColor = "#3B82F6") => {
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
export const createArrowIcon = (heading) => {
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

// Requester Custom Pin Icon
export const createRequesterIcon = () => {
  return L.divIcon({
    className: "custom-requester-icon",
    html: `
      <div style="background-color: #EF4444; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0px 4px 10px rgba(239,68,68,0.5); color: #ffffff;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Calculate Euclidean distance between two lat/lng points
export const getDistance = (p1, p2) => {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
};

// Calculate Great Circle / Haversine distance in meters between two [lat, lng] points
export const getHaversineDistanceMeters = (p1, p2) => {
  if (!p1 || !p2) return 0;
  const R = 6371000; // Earth radius in meters
  const dLat = (p2[0] - p1[0]) * (Math.PI / 180);
  const dLng = (p2[1] - p1[1]) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1[0] * (Math.PI / 180)) *
      Math.cos(p2[0] * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
