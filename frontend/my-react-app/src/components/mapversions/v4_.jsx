// Step 4: OSRM Road Navigation Routing Integration
// Concept Taught: Road-snapped Routing APIs (OSRM), GeoJSON [lng, lat] vs Leaflet [lat, lng], Axios async fetching, Fallbacks.

import React, { useEffect, useState } from "react";
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

const V4_Map = () => {
  // Preset location coordinates
  const locationA = [12.909477, 77.566833]; // Starting Location (Location A)
  const locationB = [12.914500, 77.573000]; // Destination (Location B)

  const [roadPath, setRoadPath] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(true);

  // Fallback street path following actual road turns if OSRM service is unreachable
  const fallbackRoadPath = [
    [12.909477, 77.566833],
    [12.909500, 77.568000],
    [12.911000, 77.568100],
    [12.911100, 77.571000],
    [12.914500, 77.571200],
    [12.914500, 77.573000],
  ];

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
          setRoadPath(coords);
        } else {
          setRoadPath(fallbackRoadPath);
        }
      } catch (error) {
        console.error("Failed to fetch road route from OSRM:", error);
        setRoadPath(fallbackRoadPath);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoadRoute();
  }, []);

  return (
    <div className="p-4 font-sans">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">
        V4: OSRM Road Navigation Routing
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        <span className="font-semibold text-gray-700">Point A:</span> 12.909477° N, 77.566833° E |{" "}
        <span className="font-semibold text-gray-700">Point B:</span> 12.914500° N, 77.573000° E
        {loadingRoute && (
          <span className="ml-3 font-medium text-blue-600 animate-pulse">
            (Fetching road routing path...)
          </span>
        )}
      </p>

      {/* Map container styled with Tailwind CSS */}
      <div className="h-[450px] w-full overflow-hidden rounded-xl border border-gray-300 shadow-md">
        <MapContainer
          center={locationA}
          zoom={15}
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
                <br />
                Latitude: 12.909477° N
                <br />
                Longitude: 77.566833° E
              </div>
            </Popup>
          </Marker>

          {/* Marker 2: Location B */}
          <Marker position={locationB}>
            <Popup>
              <div className="text-xs font-sans">
                <strong className="text-sm font-semibold text-green-600">Location B (Destination)</strong>
                <br />
                Latitude: 12.914500° N
                <br />
                Longitude: 77.573000° E
              </div>
            </Popup>
          </Marker>

          {/* Blue Path Line following real road geometry */}
          {roadPath.length > 0 && (
            <Polyline
              positions={roadPath}
              pathOptions={{
                color: "#2563EB", // Vibrant Blue
                weight: 6,         // Line thickness
                opacity: 0.85,
                lineJoin: "round", // Smooth turns
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default V4_Map;
