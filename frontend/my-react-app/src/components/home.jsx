import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

// Redux Actions
import { setIsAuthenticated, setUserData } from "../redux/authentication.js";
import { ban } from "../redux/banCheck.js";
import { suspect } from "../redux/checkSuspect.js";
import { setRole } from "../redux/role.js";

import Requester from "./dashboard/requester.jsx"
import Receiver from "./dashboard/receiver.jsx"



export default function Home() {
  const role = useSelector(state => state.role.value)
  const dispatch = useDispatch();

 



  return (

    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {role === "requester" && (<><Requester /></>)}
      {role === "receiver" && (<><Receiver /></>)}
    </div>



  );
}