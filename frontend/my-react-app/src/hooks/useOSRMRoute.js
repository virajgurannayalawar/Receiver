import { useState, useEffect } from "react";
import { getDistance, getHaversineDistanceMeters } from "../utils/mapUtils";

export const useOSRMRoute = ({
  baseReceiverLocation,
  effectiveReceiverLocation,
  destination,
  targetRequesterPos,
}) => {
  const [fullRoadPath, setFullRoadPath] = useState([]);
  const [remainingPath, setRemainingPath] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [shortestDistance, setShortestDistance] = useState(null);
  const [estimatedDuration, setEstimatedDuration] = useState(null);

  // Fetch OSRM Road Route & calculate shortest distance from receiver to target location
  useEffect(() => {
    const startPos = baseReceiverLocation;
    const endPos = destination || targetRequesterPos;

    if (!startPos || !endPos) return;

    const fetchRoadRoute = async () => {
      try {
        setLoadingRoute(true);
        const startLngLat = `${startPos[1]},${startPos[0]}`;
        const endLngLat = `${endPos[1]},${endPos[0]}`;

        let data = null;
        try {
          // Try OSRM foot/walking profile first (credentials omitted to pass CORS *)
          const resFoot = await fetch(
            `https://router.project-osrm.org/route/v1/foot/${startLngLat};${endLngLat}?overview=full&geometries=geojson&steps=true`,
            { credentials: "omit" }
          );
          if (resFoot.ok) {
            data = await resFoot.json();
          }
        } catch (footErr) {
          console.warn("OSRM foot profile failed, falling back to driving profile:", footErr);
        }

        if (!data || !data.routes || data.routes.length === 0) {
          // Fallback to driving profile
          const resDriving = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${startLngLat};${endLngLat}?overview=full&geometries=geojson&steps=true`,
            { credentials: "omit" }
          );
          if (resDriving.ok) {
            data = await resDriving.json();
          }
        }

        if (data?.routes?.[0]) {
          const route = data.routes[0];

          // Parse OSRM Path Coordinates Array [lat, lng]
          if (route.geometry?.coordinates && route.geometry.coordinates.length > 0) {
            const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            setFullRoadPath(coords);
          } else {
            setFullRoadPath([startPos, endPos]);
          }

          // Calculate Shortest Distance (Meters to Km)
          if (typeof route.distance === "number") {
            const distMeters = route.distance;
            if (distMeters < 1000) {
              setShortestDistance(`${Math.round(distMeters)} m`);
            } else {
              setShortestDistance(`${(distMeters / 1000).toFixed(2)} km`);
            }
          }

          // Calculate Estimated Travel Time (Seconds to Mins)
          if (typeof route.duration === "number") {
            const durMins = Math.max(1, Math.ceil(route.duration / 60));
            setEstimatedDuration(`${durMins} min${durMins > 1 ? "s" : ""}`);
          }
        } else {
          setFullRoadPath([startPos, endPos]);
          const fallbackDist = getHaversineDistanceMeters(startPos, endPos);
          setShortestDistance(fallbackDist < 1000 ? `${Math.round(fallbackDist)} m` : `${(fallbackDist / 1000).toFixed(2)} km`);
          setEstimatedDuration(`${Math.max(1, Math.ceil((fallbackDist / 1.4) / 60))} mins`);
        }
      } catch (error) {
        console.error("OSRM Route fetch error, using direct campus path & Haversine distance:", error);
        setFullRoadPath([startPos, endPos]);
        const fallbackDist = getHaversineDistanceMeters(startPos, endPos);
        setShortestDistance(fallbackDist < 1000 ? `${Math.round(fallbackDist)} m` : `${(fallbackDist / 1000).toFixed(2)} km`);
        setEstimatedDuration(`${Math.max(1, Math.ceil((fallbackDist / 1.4) / 60))} mins`);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoadRoute();
  }, [
    destination?.[0],
    destination?.[1],
    targetRequesterPos?.[0],
    targetRequesterPos?.[1],
    baseReceiverLocation?.[0],
    baseReceiverLocation?.[1],
  ]);

  // Real-time Path Erasing based on Smoothed Receiver Position
  useEffect(() => {
    const currentPos = effectiveReceiverLocation;
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
  }, [effectiveReceiverLocation, fullRoadPath]);

  return {
    fullRoadPath,
    remainingPath,
    loadingRoute,
    shortestDistance,
    estimatedDuration,
  };
};
