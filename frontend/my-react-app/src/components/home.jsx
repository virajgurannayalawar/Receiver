import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

// Redux Actions
import { setIsAuthenticated, setUserData } from "../redux/authentication.js";
import { ban } from "../redux/banCheck.js";
import { suspect } from "../redux/checkSuspect.js";
import { setRole } from "../redux/role.js";
import { setReceiverAcceptedReducer } from "../redux/receiverAccepted.js";
import { setRequesterRequested } from "../redux/requesterRequested.js";


import Requester from "./dashboard/requesterHome.jsx"
import Receiver from "./dashboard/receiverHome.jsx"



export default function Home() {
  const role = useSelector(state => state.role.value)
  const receiverAccepted = useSelector(state => state.receiverAccepted.value)
  const requesterRequested = useSelector(state => state.requesterRequested.value)
  const dispatch = useDispatch();

  return (

    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {role === "requester" && (<><RequesterHome /></>)}
      {role === "receiver" && (<><ReceiverHome /></>)}
      {receiverAccepted && (<><ReceiverActive /></>)}
      {requesterRequested && (<><RequesterActive /></>)}

    </div>



  );
}