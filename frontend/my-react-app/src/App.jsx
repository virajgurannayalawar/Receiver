import React, { use } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import Authenticate from "./components/authentication/authenticate.jsx";
import Home from "./components/home.jsx";
import Login from "./components/authentication/login.jsx"
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { useSelector, useDispatch } from 'react-redux'
import { ban, unBan } from "./redux/banCheck.js"
import { suspect, unSuspect } from "./redux/checkSuspect.js"
import { setIsAuthenticated ,setUser } from "./redux/authentication.js";
import { setDeviceFingerPrint } from "./redux/deviceFingerPrint.js";
import { setLocation } from "./redux/location.js";
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

useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}auth/check-auth`);
        if (response.data.isAuthenticated) {
          dispatch(setIsAuthenticated(true));
          if (response.data.user) {
            dispatch(setUser(response.data.user))
          }
        }
      } catch (error) {
        console.log("Session invalid or expired");
        dispatch(setIsAuthenticated(false));
      } finally {
        setLoading(false); // Finished checking
      }
    };

    verifySession();
  }, [dispatch]);


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

       useEffect(() => {



        const getLocation = async () => {
           
            try {
            
 
            } catch (err) {
                console.error("error in getting location of  device", err)
            }

        }
        getLocation();

        return () => {

            dispatch(setLocation(null))

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
                        <Home />)}
                </>) : (<div><h1>your device is suspected for fraud, login again with extra verification</h1>
                    <button onClick={() => setUrgentAuthentication(true)}>verify device now</button>
                </div>)}</>

            ) : (<div>your device is banned for attempting the fraud </div>)}
        </div>
    )
}
export default App;