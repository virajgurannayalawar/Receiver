import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

// Redux Actions
import { setIsAuthenticated, setUserData } from "../redux/authentication.js";
import { ban } from "../redux/banCheck.js";
import { suspect } from "../redux/checkSuspect.js";
import { setRole } from "../redux/role.js";
import { setReceiverAccepted } from "../redux/receiverAccepted.js";
import { setRequesterRequested } from "../redux/requesterRequested.js";

import Navbar from "./navbar/receivernavbar.jsx";
import Footer from "./footerNavigator/receiverFooter.jsx"
import Dashboard from "./dashboard/receiverDasboard.jsx"
import Active from "./activeRequests/ReceiverActiveReqList.jsx";
import History from "./history/receiverHistory.jsx";
import Profile from "./profile/profile.jsx";


export default function ReceiverHome() {
  const tab = useSelector(state => state.receiverTab.value)
  const receiverAccepted = useSelector(state => state.receiverAccepted.value)
  const dispatch = useDispatch();
   
  
  return (

    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <Navbar/>
      <main className="grow flex flex-col items-center p-6 pb-20 gap-6 max-w-md mx-auto w-full">

         
        {tab === "dashboard" && (<Dashboard />)}
        {tab === "active" && (<Active />)}
        {tab === "profile" && (<Profile />)}
        {tab === "history" && (<History />)} 
        </main >
       <Footer/>     
      
    </div >



  );
}