/*
-here the list of the previously accepted   requests will be shown then receiver can select any one to look .
-here when receiver select the req,the delivery partner like blinkit,zomato or a print shop name or a near by hotel name will be displayed.
  *then the item name,delivery boy name(vendor side),aprox weight,
  *show order got  to be delivered  ,block,floor,room 
-  the client details i.e  mobile number ,email id will be shown.



*/ 



import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../navbar/receivernavbar";
import Footer from "../footerNavigator/receiverFooter";




export default function History() {

  const dispatch = useDispatch();

   

  return (
    <div className="w-full space-y-4">
      hi i am history
    </div>
  );
}