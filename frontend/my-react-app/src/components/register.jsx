import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import axios from "axios";
import * as faceapi from "@vladmandic/face-api";

import { auth } from "../config/fireBase";

import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";






function InitialForm({ onNext, formData, setFormData }) {
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
        
    };
    
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.phone.startsWith("+")) {
            alert("Please include your country code ");
            return;
        }
        onNext();
    };
    
    
    return (
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

                <button
                    type="submit"
                    className="p-2 bg-red-200 hover:bg-red-400 cursor-pointer text-xl"
                    >
                    Submit
                </button>

            </form>
        </div>
    );
}







function PhoneVerification({ onNext, formData, recaptchaVerifierRef, setFcm_token, setFirebase_id_token }) {
    
    
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false)
    const hasSentSms = useRef(false)
    const [otp, setOtp] = useState("");
    
    
    useEffect(() => {
        if (hasSentSms.current) return;
        hasSentSms.current = true
        const sendSms = async () => {
            
            
            try {
                setIsLoading(true)
                const appVerifier = recaptchaVerifierRef.current;
                const confirmation = await signInWithPhoneNumber(auth, formData.phone, appVerifier);
                setConfirmationResult(confirmation);
                
            } catch (err) {
                console.error("error sending sms :", err);
                alert(err.message);
                hasSentSms.current = false
            } finally {
                setIsLoading(false)
            }
            
            
        }
        sendSms();
    }, [recaptchaVerifierRef, formData.phone])
    
    const verifyOtp = async (e) => {
        
        e.preventDefault();
        
        if (!confirmationResult) return;
        setIsLoading(true)
        
        try {
            const result = await confirmationResult.confirm(otp);
            const idToken = await result.user.getIdToken();
            setFirebase_id_token(idToken);
            
            setFcm_token("abcdefgh")//i will setup this afterwards
            onNext();
        } catch (err) {
            console.error("Error verifying OTP:", err);
            alert("Invalid OTP code. Please try again.");
        } finally {
            setIsLoading(false)
        }
        
        
        
        
    };
    return (
        <div>

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
                        disabled={isLoading}
                        >
                        {isLoading ? "verifying otp" : "Verify OTP"}
                    </button>
                </form>
            </div>)
        </div>
    );
}








function FaceVerification({ onNext, set_biometric_template_id, biometric_template_id }) {
    
    
    
    
    const MODEL_URL = import.meta.env.VITE_FACE_API_MODEL_URL
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModel, setIsModel] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);



    useEffect(() => {

        const loadmodel = async () => {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);

                setIsModel(true);
            } catch (err) {
                console.error('error in loading models', err)
                setIsModel(false)
            }

        }
        loadmodel();
    }, [])

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
            }
        } catch (err) {
            console.error("Error accessing camera: ", err);
        }
    };

    const scanFace = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            // Match canvas dimensions to the video stream
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw the current video frame onto the canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to a usable image URL
            const dataUrl = canvas.toDataURL("image/png");
            setImage(dataUrl);

        }
    };

    const generateBiometricTemplateId = async () => {

        setIsLoading(true)
        try {
            const detection = await faceapi.detectSingleFace(
                canvasRef.current, // Pass the canvas directly!
                new faceapi.TinyFaceDetectorOptions()
            )
                .withFaceLandmarks()
                .withFaceDescriptor();
            if (!detection) {
                throw new Error("face not detected try agian")
            }
            set_biometric_template_id(Array.from(detection.descriptor))
            console.log(biometric_template_id)
            onNext();

        } catch (err) {
            console.error("error in scanning face", err)
            alert(err.message);
            setImage(null);
            startCamera();
            setIsLoading(false)
        }
    }


    return (
        <div className="flex flex-col justify-center items-center min-h-screen gap-6 p-4">
            {/* Hidden canvas used purely for capturing the image bytes */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Video Preview Window */}
            {!image && (
                <div className="w-80 h-60 bg-gray-200 rounded-2xl overflow-hidden shadow-md flex items-center justify-center">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className={`w-full h-full object-cover ${!isStreaming ? 'hidden' : ''}`}
                    />
                    {!isStreaming && <p className="text-gray-500">Camera is off</p>}
                </div>
            )}

            {/* Captured Image Display */}
            {image && (
                <div className="w-80 h-60 rounded-2xl overflow-hidden shadow-md">
                    <img src={image} alt="Selfie" className="w-full h-full object-cover" />
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
                {!isStreaming && !image && (
                    <button
                        onClick={startCamera}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl cursor-pointer shadow-md transition"
                    >
                        Open Camera
                    </button>
                )}

                {isStreaming && !image && (
                    <button
                        onClick={scanFace}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl cursor-pointer shadow-md transition"
                    >
                        scanFace
                    </button>
                )}

                {image && (
                    <button
                        onClick={() => { setImage(null); startCamera(); }}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl cursor-pointer shadow-md transition"
                    >
                        Retake
                    </button>
                )}
                {image && (
                    <button
                        onClick={generateBiometricTemplateId}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl cursor-pointer shadow-md transition"
                        disabled={isLoading || !isModel}
                    >
                        {!isModel ? "Loading models..." : isLoading ? "Scanning face..." : "Continue"}



                    </button>
                )}
            </div>
        </div>
    );
}






// 2. Main Coordinator Component
export default function Register({ authentication, setAuthentication, deviceFingerPrint }) {
    // Use a string state to easily read and manage current steps
    const [currentStep, setCurrentStep] = useState('FORM');
    const [biometric_template_id, set_biometric_template_id] = useState(null)
    const [fcm_token, setFcm_token] = useState(null)
    const [firebase_id_token, setFirebase_id_token] = useState(null)


    const recaptchaVerifierRef = useRef(null)
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
    })

    useEffect(() => {
        if (!recaptchaVerifierRef.current) {
            try {
                recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container",
                    {
                        size: "invisible",
                        callback: (response) => {
                            console.log("Recaptcha resolved");

                        },
                        "expired-callback": () => {
                            console.log("Recaptcha expired");
                        }

                    }
                )
            } catch (err) {
                console.error("Error initializing Recaptcha:", err);
            }
        }


        return () => {
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        };

    }, []);
    useEffect(() => {
        if (currentStep === 'SUCCESS') {
            saveUser();
        }
    }, [currentStep]);


    const saveUser = async () => {
        try {

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}auth/register`, {

                id: null,
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
                name: formData.name,
                google: null,
                security: {
                    device_fingerprint: deviceFingerPrint.current,
                    firebase_id_token: firebase_id_token,
                    fcm_token: fcm_token,
                    face_verification: {
                        is_registered: true
                        ,
                        biometric_template_id: biometric_template_id
                    }
                },
                role: "client"
            }
            )
            const token = response.data.token
            localStorage.setItem("token", token);
            setAuthentication((previous) => ({
                ...previous, isAuthenticated: true,
                token: token
            }))

            // console.log({

            //         id:null,
            //         phone: formData.phone,
            //         email: formData.email,
            //         password: formData.password,
            //         name: formData.name,
            //         google: null,
            //         security: {
            //             device_fingerprint: deviceFingerPrint.current,
            //             firebase_id_token:firebase_id_token,
            //             fcm_token:fcm_token,
            //             face_verification: {
            //                 is_registered: true
            //                 ,
            //                 biometric_template_id: biometric_template_id
            //             }
            //         },
            //         role:"client"
            //     })
            // const token=1234
            //  localStorage.setItem("token", token);
            //  setAuthentication((previous) => ({ ...previous,isAuthenticated:true,
            //  token:token}))


        } catch (error) {
            console.error(error);
        } finally {
            console.log("Request completed");
        }

    }

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>User Registration</h2>

            {/* Conditional workflow controller */}
            {currentStep === 'FORM' && (
                <InitialForm onNext={() => setCurrentStep('PHONE_VERIFY')} recaptchaVerifierRef={recaptchaVerifierRef} setFormData={setFormData} formData={formData} />
            )}

            {currentStep === 'PHONE_VERIFY' && (
                <PhoneVerification onNext={() => setCurrentStep('FACE_VERIFY')} recaptchaVerifierRef={recaptchaVerifierRef} formData={formData} setFirebase_id_token={setFirebase_id_token} setFcm_token={setFcm_token} />
            )}

            {currentStep === 'FACE_VERIFY' && (
                <FaceVerification onNext={() => setCurrentStep('SUCCESS')} set_biometric_template_id={set_biometric_template_id} biometric_template_id={biometric_template_id} />
            )}


            {/* Container where Google renders the actual reCAPTCHA widget */}
            <div id="recaptcha-container" style={{ visibility: 'hidden', height: 0 }}></div>

        </div>
    );
}

