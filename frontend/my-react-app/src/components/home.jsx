import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import axios from "axios";

export default function Home({authentication,setAuthentication}){

    const logoutUser=()=>{
        localStorage.removeItem("token")
         setAuthentication((previous) => ({ ...previous,isAuthenticated:false,
            token:null}))

        
    }
    return(<div className="flex flex-center flex-col"  >
        <h1>home page</h1>
        <button onClick={logoutUser}className="bg-blue-400 rounded-3xl hover:bg-red-500 cursor-pointer text-2xl ">logut</button>
    </div>)

}