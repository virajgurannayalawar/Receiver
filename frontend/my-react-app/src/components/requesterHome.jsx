import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

// Redux Actions
import { setIsAuthenticated, setUserData } from "../redux/authentication.js";
import { ban } from "../redux/banCheck.js";
import { suspect } from "../redux/checkSuspect.js";
import { setRole } from "../redux/role.js";


import Navbar from "./navbar/requesterNavbar.jsx";
import Footer from "./footerNavigator/requesterFooter.jsx";
import Dashboard from "./dashboard/requesterDashboard.jsx"
import Active from "./activeRequests/requesterActiveReqList.jsx";
import History from "./history/requesterHistory.jsx";
import Profile from "./profile/profile.jsx";



export default function RequesterHome() {
  const tab = useSelector(state => state.requesterTab.value)
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