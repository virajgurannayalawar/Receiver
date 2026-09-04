import { useState, useEffect } from "react";
import { CAMPUS_LANDMARKS } from "../constants/campusLandmarks";

export const useRequesterDestination = ({ task = null, requesterLocation = null } = {}) => {
  // Default destination: New CSE Building
  const [destination, setDestination] = useState(CAMPUS_LANDMARKS[9].coords);
  const [selectedLandmark, setSelectedLandmark] = useState(null);
  const [targetRequesterPos, setTargetRequesterPos] = useState(null);

  // Derive Requester Location from task or props
  useEffect(() => {
    if (requesterLocation && Array.isArray(requesterLocation) && requesterLocation.length === 2) {
      setTargetRequesterPos(requesterLocation);
      setDestination(requesterLocation);
      return;
    }

    if (task) {
      // 1. Check if task details has explicit currentLocation coordinates [lng, lat]
      const coords = task?.details?.currentLocation?.coordinates;
      if (Array.isArray(coords) && coords.length === 2 && (coords[0] !== 0 || coords[1] !== 0)) {
        const latLng = [coords[1], coords[0]];
        setTargetRequesterPos(latLng);
        setDestination(latLng);
        return;
      }

      // 2. Check if task details has a block matching CAMPUS_LANDMARKS
      const blockName = task?.details?.block;
      if (blockName) {
        const matched = CAMPUS_LANDMARKS.find(
          (lm) =>
            lm.name.toLowerCase().includes(blockName.toLowerCase()) ||
            lm.id.toLowerCase().includes(blockName.toLowerCase()) ||
            blockName.toLowerCase().includes(lm.name.toLowerCase())
        );
        if (matched) {
          setTargetRequesterPos(matched.coords);
          setDestination(matched.coords);
          return;
        }
      }
    }
  }, [task, requesterLocation]);

  return {
    destination,
    setDestination,
    targetRequesterPos,
    setTargetRequesterPos,
    selectedLandmark,
    setSelectedLandmark,
  };
};
