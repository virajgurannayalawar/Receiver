import { useState, useEffect, useCallback } from "react";

export const useUserLocation = (initialPos = [12.909477, 77.566833]) => {
  const [userLocation, setUserLocation] = useState(initialPos);
  const [displayLocation, setDisplayLocation] = useState(initialPos);
  const [accuracy, setAccuracy] = useState(0);
  const [heading, setHeading] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSecureOrigin, setIsSecureOrigin] = useState(true);

  // Request user location with high->low accuracy fallback
  const requestLocation = useCallback((highAccuracy = true) => {
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

  return {
    userLocation,
    displayLocation,
    accuracy,
    heading,
    isLocating,
    errorMsg,
    isSecureOrigin,
    requestLocation,
  };
};
