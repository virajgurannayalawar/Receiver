import { useEffect, useState } from "react";
import axios from "axios";
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

export default function Dashboard() {

  const [activePage, setActivepage] = useState("Home");
  const [showPopup, setShowPopup] = useState(false); // Default to false until an error occurs

  const locationState = useSelector((state) => state.location.value);
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
      { timeout: 10000 } // Standard 10s timeout option
    );
  }, [dispatch]);

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
       const response=await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}auth/changeMode`
      );
      if (response.data.currentRole) {
      dispatch(setRole(response.data.currentRole));
      }
    } catch (err) {
console.log("error changing mode",err)
    }
  }



  // Active Sub-pages
  if (activePage === "ReqPickup") return <ReqPickup />;
  if (activePage === "ReqPrint") return <ReqPrint />;
  if (activePage === "ReqShop") return <ReqShop />;

  return (
    <>
      <div className="w-full space-y-6">
        <div
          onClick={() => setActivepage("ReqPickup")}
          className="w-full flex items-center justify-center bg-amber-400 hover:bg-amber-500 transition duration-200 cursor-pointer p-6 rounded-2xl shadow-md text-center font-bold text-lg text-amber-950"
        >
          Request a pickup at gate
        </div>

        <div
          onClick={() => setActivepage("ReqPrint")}
          className="w-full flex items-center justify-center bg-amber-400 hover:bg-amber-500 transition duration-200 cursor-pointer p-6 rounded-2xl shadow-md text-center font-bold text-lg text-amber-950"
        >
          Order prints
        </div>

        <div
          onClick={() => setActivepage("ReqShop")}
          className="w-full flex items-center justify-center bg-amber-400 hover:bg-amber-500 transition duration-200 cursor-pointer p-6 rounded-2xl shadow-md text-center font-bold text-lg text-amber-950"
        >
          Order items from nearby shops
        </div>
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