import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import Authenticate from "./components/authenticate.jsx";    
import Home from "./components/home.jsx";
 


function App(){
       const [authentication, setAuthentication] = useState(() => {
  const token = localStorage.getItem("token");
  return {
    isAuthenticated: !!token, // Convert to boolean (true if token exists, false if null)
    token: token || null
  };
});



 

    return(
 
        <div>
            {!authentication.isAuthenticated &&(
                <Authenticate authentication={authentication} setAuthentication={setAuthentication}/>)}

            {authentication.isAuthenticated &&(
                <Home authentication={authentication} setAuthentication={setAuthentication}/>)}
            
        </div>
    )
}
export default App;