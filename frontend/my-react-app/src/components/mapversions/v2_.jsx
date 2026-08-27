// Step 2: React-Leaflet Package Migration & Tailwind CSS
// Concept Taught: Declarative React Map Components, React Context, Vite Asset Fix, and Tailwind CSS Layout.

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

const V2_Map = () => {
  // Preset location coordinates (12.909477° N, 77.566833° E)
  const position = [12.909477, 77.566833];

  return (
    <div className="p-4 font-sans">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">
        V2: React-Leaflet Migration & Tailwind CSS
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        <span className="font-semibold text-gray-700">Preset Location:</span>{" "}
        12.909477° N, 77.566833° E
      </p>

      {/* Map container styled with Tailwind CSS */}
      <div className="h-[450px] w-full overflow-hidden rounded-xl border border-gray-300 shadow-md">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <div className="text-xs font-sans">
                <strong className="text-sm font-semibold">Preset Location</strong>
                <br />
                Latitude: 12.909477° N
                <br />
                Longitude: 77.566833° E
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default V2_Map;
