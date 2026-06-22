import User from "../models/User.js";
import BannedDevice from "../models/bannedDevice.js";
import { generateToken } from "../utils/jwt.js";
import bcrypt from "brcypt"
import admin from "../config/firebaseAdmin.js";




export const registerUser = async (req, res) => {
  try {
    const { phone, email, password, name, google, security } = req.body
    let profile_picture = req.body.profile_picture; 
    if (!phone || !email || !password) {
      return res.status(400).json({ message: "Phone, email, and password are required" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (!security.firebase_id_token) {
      return res.status(400).json({ message: " firebase token is missing." });
    }
    if (security.face_verification.is_registered == false) {
      return res.status(400).json({ message: "Face verification is required" });
    }
    
    if (google) {
     profile_picture = google.profile
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }
  
    

    // 1. CRYPTOGRAPHICALLY VERIFY THE OTP TOKEN VIA FIREBASE ADMIN SDK. This safely decodes the token using Google's cached public keys
    const decodedFirebaseToken = await admin.auth().verifyIdToken(security.firebase_id_token);

    // 2. Extract the verified number from the token payload
    const verifiedPhoneNumber = decodedFirebaseToken.phone_number;

    // 3. Cross-verify frontend phone string matches Firebase's carrier network data
    if (phone !== verifiedPhoneNumber) {
      return res.status(400).json({
        error: "Security Mismatch: Submitted mobile number does not match the verified SMS device."
      });
    }




  // encrypting the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

  // checking if the face is already registered
    const is_face_registered = await User.findOne({ "security.face_verification.biometric_template_id": security.face_verification.biometric_template_id })
    if (is_face_registered) {
      return res.status(400).json({ message: "Face already registered with another account" });
    }

    delete security.firebase_id_token


    
    const newUser = new User({
      phone,
      email,
      password: hashedPassword,
      name,
      profile_picture,
      google,
      face_verification,
      security
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPassword = await bcrypt.compare(password, user.password)
    if (!isPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = generateToken(user)
    user.token_version = user.token_version + 1
    await user.save()

    res.status(200).json({
      message: "User logged in successfully",
      user: user,
      token: token
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}



export const GoogleLogin = async (req, res) => {
  try {
    const google = req.body
    const user = await User.findOne({ "google.id": google.id });
    if (!user) {
     return res.send({ message: "register user" })
    } 
    if(req.suspected_device)
    {
      const is_face_registered = await User.findOne({ "security.face_verification.biometric_template_id": security.face_verification.biometric_template_id })
      if(!is_face_registered)
      {
        return res.status(400).json({ message: "Face not registered with this user,try again face verification" });
      }
      
      await BannedDevice.updateOne({ $pull: { suspected_devices: device_fingerprint } })
    }
    const token = generateToken(user)
    user.token_version = user.token_version + 1
    await user.save()
    res.status(200).json({
      message: "User logged in successfully",
      user: user,
      token: token
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }



}

