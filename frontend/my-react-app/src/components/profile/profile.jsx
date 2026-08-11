


import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../navbar/receivernavbar";
import Footer from "../footerNavigator/receiverFooter";




export default function Profile() {

  const dispatch = useDispatch();

 
  return (

   <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
 
        <main className="grow flex flex-col justify-center items-center p-6 gap-6 max-w-md mx-auto w-full">



          <div className="w-full space-y-4">
            
              hi i am profile
           
          </div>

        </main>

 
          
        
      </div>
  );
}