import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import axios from "axios"
import { setIsAuthenticated, setUser } from "../redux/authentication.js";
import { ban } from "../redux/banCheck.js";
import { suspect } from "../redux/checkSuspect.js";

import { useSelector, useDispatch } from 'react-redux'
import ReqPickup from "./dashboard/reqPickup.jsx";


export default function Home() {
  const authentication = useSelector(state => state.authentication.value)
  const [loading, setLoading] = useState(true);
  const [activePage, setActivepage] = useState('Home');

  const dispatch = useDispatch()

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


  const logoutUser = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}auth/logout`);
      if (response) {
        dispatch(setIsAuthenticated(false))
      }


    } catch (err) {
      const serverMessage = err.response?.data?.message;

      if (serverMessage == "User is banned" || serverMessage == "Device is banned") {
        dispatch(ban())
        return
      }
      if (serverMessage == "Device is suspected need further verification.please verify face  ") {
        dispatch(suspect())
        return
      }
      if (serverMessage == "session expired") {
        dispatch(setIsAuthenticated(false))
        return
      }


      console.error("error while logout:", err)
    }

  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }


if (activePage == "ReqPickup" )
{
return <ReqPickup/> ;
}
if (activePage=="ReqPrint" )
{
return <ReqPrint/>;
}
if (activePage=="ReqShop" )
{
return <ReqShop/>;
}






  return (<>
  <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
    <header className="flex justify-between items-center p-4 bg-white shadow-sm">
      <h1 className="text-xl font-bold  tracking-tight">Home Page</h1>
      <button
        onClick={logoutUser}
        className="px-4 py-2 bg-red-400 hover:bg-red-800 text-white text-sm font-semibold rounded-lg shadow-sm transition duration-200 cursor-pointer"
      >
        Logout
      </button>
    </header>
    <main className=" grow flex flex-col justify-center items-center p-6 gap-6 max-w-md mx-auto w-full">


      <div onClick={()=> setActivepage("ReqPickup")} className="w-full flex items-center justify-center bg-amber-400 hover:bg-amber-500 transition duration-200 cursor-pointer p-6 rounded-2xl shadow-md text-center font-bold text-lg text-amber-950">
        Request a pickup at gate
      </div>

      <div onClick={()=> setActivepage("ReqPrint")} className="w-full flex items-center justify-center bg-amber-400 hover:bg-amber-500 transition duration-200 cursor-pointer p-6 rounded-2xl shadow-md text-center font-bold text-lg text-amber-950">
        Order prints
      </div>

      <div onClick={()=> setActivepage("ReqShop")} className="w-full flex items-center justify-center bg-amber-400 hover:bg-amber-500 transition duration-200 cursor-pointer p-6 rounded-2xl shadow-md text-center font-bold text-lg text-amber-950">
        Order items from nearby shops
      </div>
    </main>

    <footer className="bg-white border-t border-gray-200 shadow-lg py-4">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <div className="text-sm font-semibold text-gray-600 hover:text-blue-500 cursor-pointer transition">Dashboard</div>
        <div className="text-sm font-semibold text-gray-600 hover:text-blue-500 cursor-pointer transition">Active Requests</div>
        <div className="text-sm font-semibold text-gray-600 hover:text-blue-500 cursor-pointer transition">Profile</div>
        <div className="text-sm font-semibold text-gray-600 hover:text-blue-500 cursor-pointer transition">History</div>
      </div>
    </footer>


  </div>
  </>
  )
}