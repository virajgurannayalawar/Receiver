// DSI Campus Interactive Map Component
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { CAMPUS_LANDMARKS } from "../constants/campusLandmarks";
import { createLandmarkIcon, createArrowIcon, createRequesterIcon } from "../utils/mapUtils";
import { useUserLocation } from "../hooks/useUserLocation";
import { useRequesterDestination } from "../hooks/useRequesterDestination";
import { useOSRMRoute } from "../hooks/useOSRMRoute";

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

const MapComponent = ({ task = null, receiverLocation = null, requesterLocation = null }) => {
  const defaultInitialPos = [12.909477, 77.566833];

  // Custom Hooks
  const {
    userLocation,
    displayLocation,
    accuracy,
    heading,
    isLocating,
    requestLocation,
  } = useUserLocation(defaultInitialPos);

  const {
    destination,
    setDestination,
    targetRequesterPos,
    setSelectedLandmark,
  } = useRequesterDestination({ task, requesterLocation });

  const effectiveReceiverLocation = receiverLocation || displayLocation || userLocation;
  const baseReceiverLocation = receiverLocation || userLocation || defaultInitialPos;

  const {
    remainingPath,
    loadingRoute,
    shortestDistance,
    estimatedDuration,
  } = useOSRMRoute({
    baseReceiverLocation,
    effectiveReceiverLocation,
    destination,
    targetRequesterPos,
  });

  const currentCompassHeading = Math.round(((heading % 360) + 360) % 360);

  return (
    <div className="w-full h-full relative font-sans select-none overflow-hidden">
      <MapContainer
        center={effectiveReceiverLocation}
        zoom={18}
        maxZoom={22}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full cursor-crosshair z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={22}
          maxNativeZoom={19}
        />

        <RecenterMap location={effectiveReceiverLocation} />
        <MapClickHandler onSelectDestination={(pos) => setDestination(pos)} />

        {/* Receiver Accuracy Circle */}
        {accuracy > 0 && (
          <Circle
            center={effectiveReceiverLocation}
            radius={accuracy}
            pathOptions={{
              color: "#3B82F6",
              fillColor: "#60A5FA",
              fillOpacity: 0.15,
              weight: 1,
            }}
          />
        )}

        {/* Receiver Rotatable Arrow Marker */}
        <Marker position={effectiveReceiverLocation} icon={createArrowIcon(currentCompassHeading)}>
          <Popup>
            <div className="text-xs font-sans">
              <strong className="text-sm font-semibold text-blue-600">Receiver Live GPS Location</strong>
            </div>
          </Popup>
        </Marker>

        {/* Target Requester Destination Pin Marker */}
        {targetRequesterPos && (
          <Marker position={targetRequesterPos} icon={createRequesterIcon()}>
            <Popup>
              <div className="p-1 font-sans text-xs min-w-[160px]">
                <span className="inline-block rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 mb-1">
                  Requester Destination
                </span>
                <strong className="block text-sm font-bold text-gray-900 mb-0.5">
                  {task?.requester_id?.name || "Requester"}
                </strong>
                {task?.details && (
                  <p className="text-gray-600 text-[11px] mb-1">
                    Block {task.details.block}, Floor {task.details.floor}, Room {task.details.room}
                  </p>
                )}
                {shortestDistance && (
                  <p className="text-blue-600 font-bold text-xs mt-1">
                    Shortest Dist: {shortestDistance}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

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

        {/* OSRM Shortest Path Blue Polyline Line */}
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

      {/* Floating Shortest Distance & ETA Info Card Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-200/80 min-w-[220px] max-w-[280px] font-sans">
        <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-1.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h4 className="text-[11px] font-bold text-gray-800 tracking-wider uppercase">
            OSRM Shortest Path
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-blue-50/80 p-2 rounded-xl border border-blue-100">
            <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider block">Shortest Dist</span>
            <span className="text-xs font-extrabold text-blue-900 mt-0.5 block">
              {loadingRoute ? "Calculating..." : shortestDistance || "N/A"}
            </span>
          </div>

          <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-100">
            <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block">Est. Time</span>
            <span className="text-xs font-extrabold text-emerald-900 mt-0.5 block">
              {loadingRoute ? "Calculating..." : estimatedDuration || "N/A"}
            </span>
          </div>
        </div>

        {task?.details && (
          <div className="mt-2 pt-1.5 text-[10px] text-gray-600 border-t border-gray-100 flex flex-col gap-0.5">
            <div className="flex justify-between">
              <span className="text-gray-400">Requester:</span>
              <span className="font-semibold text-gray-800 truncate max-w-[130px]">{task.requester_id?.name || "Requester"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Target Block:</span>
              <span className="font-semibold text-gray-800 truncate max-w-[130px]">{task.details?.block || "N/A"} (Rm {task.details?.room || "N/A"})</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Locate Button in top right corner */}
      <button
        onClick={() => requestLocation(true)}
        disabled={isLocating}
        className="absolute top-4 right-4 z-[1000] bg-white/90 hover:bg-white text-blue-600 p-2.5 rounded-full shadow-lg border border-gray-200 active:scale-95 transition cursor-pointer flex items-center justify-center"
        title="Locate Me"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
        </svg>
      </button>
    </div>
  );
};

export default MapComponent;
