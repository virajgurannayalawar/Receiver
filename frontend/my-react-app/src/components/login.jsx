import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import axios from "axios";

export default function Login({authentication,setAuthentication})
{   useEffect(()=>{
    localStorage.setItem("token", "123456");
    setAuthentication((previous) => ({ ...previous,isAuthenticated:true,
            token:"123456"}))
},[])
    return(
        <>  
        <div>logged in</div>
        </>
    )
}