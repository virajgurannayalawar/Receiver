import React, { use } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import Authenticate from "./components/authenticate.jsx";    
import Home from "./components/home.jsx";
import FingerprintJS from '@fingerprintjs/fingerprintjs'


function App(){
       const deviceFingerPrint=useRef(null)
       const [authentication, setAuthentication] = useState(() => {
  const token = localStorage.getItem("token");
  return {
    isAuthenticated: !!token, // Convert to boolean (true if token exists, false if null)
    token: token || null
  };
});

useEffect(()=>{

    

    const loadFingerPrintJs=async()=>{
// Initialize the agent at application startup.
try{
    const fpPromise = await FingerprintJS.load();

  // Get the visitor identifier when you need it.
  const fp = await fpPromise
  const result = await fp.get()
  console.log(result.visitorId)
  deviceFingerPrint.current=result.visitorId
  localStorage.setItem("deviceFingerPrint",deviceFingerPrint.current)
}catch(err){
    console.error("error in fingerprinting device",err)
}

    }
    loadFingerPrintJs();

    return () => {
                 
                deviceFingerPrint.current = null;
            
        };
},[])

 

    return(
 
        <div>
            {!authentication.isAuthenticated &&(
                <Authenticate authentication={authentication} setAuthentication={setAuthentication} deviceFingerPrint={deviceFingerPrint}/>)}

            {authentication.isAuthenticated &&(
                <Home authentication={authentication} setAuthentication={setAuthentication}/>)}
            
        </div>
    )
}
export default App;