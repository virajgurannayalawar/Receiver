


import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../navbar/receivernavbar";
import Footer from "../footerNavigator/receiverFooter";




export default function Profile() {

  const dispatch = useDispatch();

 
  return (
    <div className="w-full space-y-4">
      hi i am profile
    </div>
  );
}