// Map Versions Playground: Interactive Version Switcher for Teaching
import React, { useState } from "react";
import V1_Map from "./v1_.jsx";
import V2_Map from "./v2_.jsx";
import V3_Map from "./v3_.jsx";
import V4_Map from "./v4_.jsx";
import V5_Map from "./v5_.jsx";
import V6_Map from "./v6_.jsx";
import V7_Map from "./v7_.jsx";
import V8_Map from "./v8_.jsx";
import V9_Map from "./v9_.jsx";
import V10_Map from "./v10_.jsx";

const MapVersionsIndex = () => {
  const [activeVersion, setActiveVersion] = useState("v10");

  const versions = [
    { key: "v1", label: "V1: Vanilla CDN Leaflet", component: <V1_Map /> },
    { key: "v2", label: "V2: React-Leaflet & Tailwind", component: <V2_Map /> },
    { key: "v3", label: "V3: Multi-Marker & Straight Line", component: <V3_Map /> },
    { key: "v4", label: "V4: OSRM Road Navigation Routing", component: <V4_Map /> },
    { key: "v5", label: "V5: Animated Navigation & Erasing Path", component: <V5_Map /> },
    { key: "v6", label: "V6: Live Geolocation & Compass Rotation", component: <V6_Map /> },
    { key: "v7", label: "V7: Click Map Destination & Path Erasing", component: <V7_Map /> },
    { key: "v8", label: "V8: Pure Live GPS & Real Movement Erasing", component: <V8_Map /> },
    { key: "v9", label: "V9: Smooth Arrow LERP & Mobile Gestures", component: <V9_Map /> },
    { key: "v10", label: "V10: DSI Campus 27 Landmark Icons", component: <V10_Map /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Map Development Roadmap (V1 to V10)
          </h1>
          <p className="text-sm text-gray-600">
            Interactive version switcher to teach map development step-by-step from scratch.
          </p>
        </header>

        {/* Tab Navigation Controls */}
        <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-white p-2 shadow-sm border border-gray-200">
          {versions.map((ver) => (
            <button
              key={ver.key}
              onClick={() => setActiveVersion(ver.key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                activeVersion === ver.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {ver.label}
            </button>
          ))}
        </div>

        {/* Active Version Container */}
        <div className="rounded-2xl bg-white shadow-lg border border-gray-200 overflow-hidden">
          {versions.find((v) => v.key === activeVersion)?.component}
        </div>
      </div>
    </div>
  );
};

export default MapVersionsIndex;
