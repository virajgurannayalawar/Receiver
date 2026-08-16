//

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import useSocket from "../../hooks/useSocket.js";

//actions
import { setRequesterTab } from "../../redux/requesterTab.js";



export default function Footer() {
   
  const dispatch = useDispatch();



  
  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg py-4">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <div onClick={()=>dispatch(setRequesterTab("dashboard"))} className="text-sm font-semibold text-gray-600 hover:text-blue-500 cursor-pointer transition">
            Dashboard
          </div>
          <div onClick={()=>dispatch(setRequesterTab("active"))} className="text-sm font-semibold text-gray-600 hover:text-blue-500 cursor-pointer transition">
            Active  
          </div>
          <div onClick={()=>dispatch(setRequesterTab("profile"))} className="text-sm font-semibold text-gray-600 hover:text-blue-500 cursor-pointer transition">
            Profile
          </div>
          <div onClick={()=>dispatch(setRequesterTab("history"))} className="text-sm font-semibold text-gray-600 hover:text-blue-500 cursor-pointer transition">
            History
          </div>
        </div>
      </footer>
    </>
  );
}