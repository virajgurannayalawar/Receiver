import React, { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import axios from "axios";
import { auth } from "../config/fireBase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";






export default function Register() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otp, setOtp] = useState("");
    const recaptchaVerifierRef = useRef(null)
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
    })




useEffect(()=>{
if (!recaptchaVerifierRef.current){
    try{
        recaptchaVerifierRef.current=new RecaptchaVerifier(auth,"recaptcha-container",
            {
             size:"normal",
             callback:(response)=>{
                console.log("Recaptcha resolved");

             },
             "expired-callback":()=>{
                console.log("Recaptcha expired");
             }

            }
        )
    }catch(err){
        console.error("Error initializing Recaptcha:", err);
    }
}

return ()=>{
    if (recaptchaVerifierRef.current){
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current=null;
    }
};




},[]);










    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((previous) => ({ ...previous, [name]: value }));

    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the page from refreshing on submit
        if (!formData.phone.startsWith("+")) {
            alert("Please include your country code ");
            return;
        }


        try {
            const appVerifier = recaptchaVerifierRef.current;
            const confirmation = await signInWithPhoneNumber(auth, formData.phone, appVerifier);
            setConfirmationResult(confirmation);
            setIsSubmitted(true);


        } catch (err) {
            console.error("error sending sms :", err);
            alert(err.message);
        }

    };
    const verifyOtp = async (e) => {
        e.preventDefault();
        if(!confirmationResult) return;

        try{
            const result= await confirmationResult.confirm(otp);
            console.log("User signed in :",result.user)
            setIsOtpVerified(true);
        }catch(err){
            console.error("Error verifying OTP:", err);
      alert("Invalid OTP code. Please try again.");
        }
        
    };









    return (

        <div className="flex flex-col gap-4 ">





            {!isSubmitted ? (
                <div className="flex flex-col gap-4" >
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                            className="bg-white text-2xl font-medium p-2 border"
                        />
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Contact Number (with +country code)"
                            className="bg-white text-2xl font-medium p-2 border"
                        />
                        <input
                            type="email"
                            name="email" // Wait, mapping form to state
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email Id"
                            className="bg-white text-2xl font-medium p-2 border"
                        />
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                            className="p-2 border text-2xl"
                        />
                        {/* Container where Google renders the actual reCAPTCHA widget */}
                        <div id="recaptcha-container"></div>

                        <button
                            type="submit"
                            className="p-2 bg-red-200 hover:bg-red-400 cursor-pointer text-xl"
                        >
                            Submit
                        </button>

                    </form>
                </div>

            ) : !isOtpVerified ?
                (<div className="flex flex-col gap-4">

                    <form onSubmit={verifyOtp} className="flex flex-col gap-4">
                        <input
                            type="text"
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="bg-white text-2xl font-medium p-2 border"
                        />
                        <button
                            type="submit"
                            className="p-2 bg-blue-200 hover:bg-blue-400 cursor-pointer text-xl"
                        >
                            Verify OTP
                        </button>
                    </form>


                </div>):(<div>

                mobile number verified sucessfully ,thank you 

            </div>)
            

            }
            








        </div>
    )
}