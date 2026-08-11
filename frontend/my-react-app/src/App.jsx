import React, { use } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import Authenticate from "./components/authentication/authenticate.jsx";
import RoleSetter from "./components/RoleSetter.jsx";
import Login from "./components/authentication/login.jsx"




import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { useSelector, useDispatch } from 'react-redux'
import { ban, unBan } from "./redux/banCheck.js"
import { suspect, unSuspect } from "./redux/checkSuspect.js"
import { setIsAuthenticated ,setUserData } from "./redux/authentication.js";
import { setDeviceFingerPrint } from "./redux/deviceFingerPrint.js";
import { setLocation } from "./redux/location.js";
import { setRole } from "./redux/role.js";
import axios from "axios";


function App() {

    const isBanned = useSelector(state => state.banCheck.value)
    const isSuspected = useSelector(state => state.checkSuspect.value)
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch()
    const [urgentAuthentication, setUrgentAuthentication] = useState(false)
    const authentication = useSelector(state => state.authentication.value)
    const deviceFingerPrint = useSelector(state => state.deviceFingerPrint.value)

    axios.defaults.withCredentials=true;


    // Verify User Session
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}auth/check-auth`
        );
        if (response.data.isAuthenticated) {
          dispatch(setIsAuthenticated(true));
          if (response.data.user) {
            dispatch(setUserData(response.data.user));
          }
        }
       
      } catch (error) {
        const serverMessage = error.response?.data?.message;

        if (serverMessage === "User is banned" || serverMessage === "Device is banned") {
          dispatch(ban());
          return;
        }

        if (serverMessage === "Device is suspected need further verification.please verify face  ") {
          dispatch(suspect());
          return;
        }
        if (serverMessage === "session expired") {
          dispatch(setIsAuthenticated(false));
          return;
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [dispatch]);

  // Check Role Mode from backend and sync with Redux
  useEffect(() => {
    const checkRole = async () => {
      if (!authentication.isAuthenticated) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}auth/checkRole`
        );
        if (response.data.currentRole) {
          dispatch(setRole(response.data.currentRole));
        }
      } catch (error) {
        console.error("Failed to fetch current role mode:", error);
      }
    };

    checkRole();
  }, [authentication.isAuthenticated, dispatch]);

  useEffect(() => {




        const loadFingerPrintJs = async () => {
            // Initialize the agent at application startup.
            try {
                const fpPromise = await FingerprintJS.load();

                // Get the visitor identifier when you need it.
                const fp = await fpPromise
                const result = await fp.get()
                console.log(result.visitorId)
                dispatch(setDeviceFingerPrint(result.visitorId))
                localStorage.setItem("deviceFingerPrint", result.visitorId)
            } catch (err) {
                console.error("error in fingerprinting device", err)
            }

        }
        loadFingerPrintJs();

        return () => {

            dispatch(setDeviceFingerPrint(null))

        };
    }, [])

      

if (loading) {
    return <div className="flex h-screen items-center justify-center text-2xl font-semibold">Verifying Session...</div>;
}



    return (

        <div>
            {urgentAuthentication && (<Login/>)}
            {!isBanned ? (<>
                {!isSuspected ? (<>
                    {!authentication.isAuthenticated && (
                        <Authenticate/>)}
                    {authentication.isAuthenticated && (
                        <RoleSetter/>)}
                </>) : (<div><h1>your device is suspected for fraud, login again with extra verification</h1>
                    <button onClick={() => setUrgentAuthentication(true)}>verify device now</button>
                </div>)}</>

            ) : (<div>your device is banned for attempting the fraud </div>)}
        </div>
    )
}
export default App;