/*
-here the list of previous requests will be shown then client can select any one to look  .
-here when client select the req,the delivery partner like blinkit,zomato or a print shop name or a near by hotel name will be displayed.
  *then the item name,delivery boy name(vendor side),aprox weight,
  *show order delivered date/time,block,floor,room 
-  the receiver details i.e  mobile number ,email id will be shown.
-transaction: unique transaction id, transaction status  


*/ 



import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../navbar/receivernavbar";
import Footer from "../footerNavigator/receiverFooter";




export default function History() {

  const dispatch = useDispatch();

 

  return (

   <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
        
 
        <main className="grow flex flex-col justify-center items-center p-6 gap-6 max-w-md mx-auto w-full">



          <div className="w-full space-y-4">
            
              hi i am history
           
          </div>

        </main>

    
        
      </div>
  );
}