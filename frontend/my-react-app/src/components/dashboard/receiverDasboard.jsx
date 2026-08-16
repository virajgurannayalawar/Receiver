//

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import useSocket from "../../hooks/useSocket.js";
import { setPickupReqs } from "../../redux/pickupReq.js";


// Redux Actions
import { setIsAuthenticated } from "../../redux/authentication.js";
import { ban } from "../../redux/banCheck.js";
import { suspect } from "../../redux/checkSuspect.js";
import { setLocation, setError } from "../../redux/location.js";
import { setRole } from "../../redux/role.js";
import LiveReq from "./liveReq.jsx";



export default function Dashboard() {
  const [showPopup, setShowPopup] = useState(false);

  const locationState = useSelector((state) => state.location.value);
  const pickupReqs = useSelector((state) => state.pickupReqs.value);
  const dispatch = useDispatch();



  // Handle Geolocation
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      dispatch(
        setError(
          "Geolocation is not supported by your browser. Please switch to a supported device."
        )
      );
      setShowPopup(true);
      return;
    }

    dispatch(setError(""));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        dispatch(
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        );
      },
      (err) => {
        let message = "Failed to get location.";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = "Permission denied.";
            break;
          case err.POSITION_UNAVAILABLE:
            message = "Location unavailable.";
            break;
          case err.TIMEOUT:
            message = "Request timed out.";
            break;
          default:
            console.log("Failed to get location for unknown reason: ", err);
        }
        dispatch(setError(message));
        setShowPopup(true);
      },
      { timeout: 10000 }
    );
  }, [dispatch]);

  useEffect(() => {
    const fetchPickupRequests = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}pickup/fetchRequests`,
          {
            withCredentials: true,
          }
        );

        dispatch(setPickupReqs(response.data.pickupReqs));
      } catch (err) {
        console.error("Failed to fetch pickup requests:", err);

        const serverMessage = err.response?.data?.message;

        if (
          serverMessage === "User is banned" ||
          serverMessage === "Device is banned"
        ) {
          dispatch(ban());
          return;
        }

        if (
          serverMessage ===
          "Device is suspected need further verification.please verify face"
        ) {
          dispatch(suspect());
          return;
        }

        if (serverMessage === "session expired") {
          dispatch(setIsAuthenticated(false));
        }
      }
    };

    fetchPickupRequests();
  }, [dispatch]);

  useSocket("pickup:new", (pickup) => {
    if (!pickupReqs.some((req) => req._id === pickup._id)) {
      dispatch(setPickupReqs([pickup, ...pickupReqs]));
    }
  });

  // Logout Action
  const logoutUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}auth/logout`
      );
      if (response) {
        dispatch(setIsAuthenticated(false));
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message;

      if (
        serverMessage === "User is banned" ||
        serverMessage === "Device is banned"
      ) {
        dispatch(ban());
        return;
      }
      if (
        serverMessage ===
        "Device is suspected need further verification.please verify face"
      ) {
        dispatch(suspect());
        return;
      }
      if (serverMessage === "session expired") {
        dispatch(setIsAuthenticated(false));
        return;
      }

      console.error("Error while logging out:", err);
    }
  };
  const changeMode = async () => {

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}auth/changeMode`
      );
      if (response.data.currentRole) {
        dispatch(setRole(response.data.currentRole));
      }
    } catch (err) {
      console.log("error changing mode", err)
    }
  }

  return (
    <>
      <div className="w-full space-y-4">
        {pickupReqs.length === 0 ? (
          <p className="text-center text-gray-500">
            No pickup requests available.
          </p>
        ) : (
          (pickupReqs || []).map((pickup) => (
            <LiveReq key={pickup._id} pickup={pickup}/> 
          ))
        )}
      </div>

      {/* Dynamic Error Popup */}
      {showPopup && locationState.error && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96 text-center">
            <h2 className="text-2xl font-bold mb-4">Location Required</h2>
            <p className="mb-6 text-gray-600">{locationState.error}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}