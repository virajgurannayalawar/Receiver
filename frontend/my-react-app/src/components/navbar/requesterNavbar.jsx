 



import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setRequesterRequested } from "../../redux/requesterRequested.js";
import { setIsAuthenticated } from "../../redux/authentication.js";
import { ban } from "../../redux/banCheck.js";
import { suspect } from "../../redux/checkSuspect.js";
import { setRole } from "../../redux/role.js";




export default function Navbar() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setRequesterRequested(false));
  }, [dispatch]);


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

   <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
        <header className="flex justify-between items-center p-4 bg-white shadow-sm">
          <h1 className="text-xl font-bold tracking-tight">Home Page</h1>
          <h1 className="text-xl font-bold tracking-tight">requester</h1>
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
      </div>
  );
}