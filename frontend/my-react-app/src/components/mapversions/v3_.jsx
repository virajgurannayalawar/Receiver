// Step 3: Multi-Marker & Straight Polyline Path
// Concept Taught: Vector Layers, Polylines, Multi-marker maps, and Euclidean line overlays.

import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
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

const V3_Map = () => {
  // Preset location coordinates
  const locationA = [12.909477, 77.566833]; // Starting Location (Location A)
  const locationB = [12.914500, 77.573000]; // Nearby Destination (Location B)

  // Coordinates array for the straight Polyline path
  const pathCoordinates = [locationA, locationB];

  return (
    <div className="p-4 font-sans">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">
        V3: Multi-Marker & Straight Polyline Route
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        <span className="font-semibold text-gray-700">Point A:</span> 12.909477° N, 77.566833° E |{" "}
        <span className="font-semibold text-gray-700">Point B:</span> 12.914500° N, 77.573000° E
      </p>

      {/* Map container styled with Tailwind CSS */}
      <div className="h-[450px] w-full overflow-hidden rounded-xl border border-gray-300 shadow-md">
        <MapContainer
          center={locationA}
          zoom={14}
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

          {/* Blue Path Connecting Point A and Point B (Straight Line) */}
          <Polyline
            positions={pathCoordinates}
            pathOptions={{
              color: "#2563EB", // Vibrant Blue
              weight: 5,         // Line thickness
              opacity: 0.8,
            }}
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default V3_Map;
