import User from "../models/User.js";
import BannedDevice from "../models/bannedDevice.js";

export default async function banCheckMiddleware(req, res, next) {
    try {
        const is_faceid_included=req.body.security.face_verification.biometric_template_id
        const device_fingerprint = req.body.security.device_fingerprint;
        const user = await User.findById(req.id);
        if(user){if (user.security.is_user_banned) {
            return res.status(403).json({ message: "User is banned" });
        }
        const bannedDevice = await BannedDevice.findOne({ device_fingerprint });
        if (bannedDevice) {
            return res.status(403).json({ message: "Device is banned" });
        }
        if(bannedDevice.suspected_devices.includes(device_fingerprint) && !is_faceid_included ){
            return res.status(403).json({ message: "Device is suspected need further verification.please verify face  " });
        }
        if(bannedDevice.suspected_devices.includes(device_fingerprint)&&is_faceid_included)
        {
         req.suspected_device =true
        }
        next();} else{
            next();
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}