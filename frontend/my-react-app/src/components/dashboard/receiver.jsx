//

import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";



import { useSelector, useDispatch } from "react-redux";

// Redux Actions
import { setIsAuthenticated } from "../../redux/authentication.js";
import { ban } from "../../redux/banCheck.js";
import { suspect } from "../../redux/checkSuspect.js";
import { setLocation, setError } from "../../redux/location.js";
import { setRole } from "../../redux/role.js";


// Dashboard Pages
import ReqPickup from "./reqPickup.jsx";
import ReqPrint from "./reqPrint.jsx"; // Adjusted to correct path
import ReqShop from "./reqShop.jsx";   // Adjusted to correct path

export default function Receiver() {
  const [loading, setLoading] = useState(true);
  const [pickupdata, setpickupdata] = useState(null);
  const [activePage, setActivepage] = useState("Home");
  const [showPopup, setShowPopup] = useState(false); // Default to false until an error occurs

  const locationState = useSelector((state) => state.location.value);
  const dispatch = useDispatch();

  const socket = io("http://localhost:5000");

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
      { timeout: 10000 } // Standard 10s timeout option
    );
  }, [dispatch]);

    useEffect(() => {
    socket.on("newPickup", (request) => {

        console.log(request);
        setpickupdata(request)

    });

    return () => {
        socket.off("newPickup");
    };

}, []);
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



  // Active Sub-pages
  if (activePage === "ReqPickup") return <ReqPickup />;
  if (activePage === "ReqPrint") return <ReqPrint />;
  if (activePage === "ReqShop") return <ReqShop />;

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
        <header className="flex justify-between items-center p-4 bg-white shadow-sm">
          <h1 className="text-xl font-bold tracking-tight">Home Page</h1>
          <h1 className="text-xl font-bold tracking-tight">receiver</h1>
          <button
            onClick={logoutUser}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow-sm transition duration-200 cursor-pointer"
          >
            Logout
          </button>
          <button
            onClick={changeMode}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow-sm transition duration-200 cursor-pointer"
          >
            change mode
          </button>
        </header>

        <main className="grow flex flex-col justify-center items-center p-6 gap-6 max-w-md mx-auto w-full">
           
        
          
<div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
  <div className="flex flex-col">
    <span className="text-[11px] text-gray-400 uppercase tracking-wide">
      Vendor
    </span>
    <span className="text-base font-semibold text-gray-900">
      ABC Electronics
    </span>
  </div>

  <div className="flex flex-col items-center">
    <span className="text-[11px] text-gray-400 uppercase tracking-wide">
      Deliver To
    </span>
    <span className="px-3 py-1 mt-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
      Block B
    </span>
  </div>

  <div className="flex flex-col items-end">
    <span className="text-[11px] text-gray-400 uppercase tracking-wide">
      ETA
    </span> 
    <span className="mt-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
      12 min
    </span>
  </div>
</div>
         
        </main>

        <footer className="bg-white border-t border-gray-200 shadow-lg py-4">
          <div className="flex justify-around items-center max-w-md mx-auto">
            <div className="text-sm font-semibold text-gray-600 hover:text-blue-500 cursor-pointer transition">
              Dashboard
            </div>
            <div className="text-sm font-semibold text-gray-600 hover:text-blue-500 cursor-pointer transition">
              Active Requests
            </div>
            <div className="text-sm font-semibold text-gray-600 hover:text-blue-500 cursor-pointer transition">
              Profile
            </div>
            <div className="text-sm font-semibold text-gray-600 hover:text-blue-500 cursor-pointer transition">
              History
            </div>
          </div>
        </footer>
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