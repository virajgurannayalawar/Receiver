import mongoose from "mongoose";

const BannedDeviceSchema = new mongoose.Schema({
    device_fingerprint: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    ban_reason: {
        type: String,
        required: true
    },
    banned_at: {
        type: Date,
        default: Date.now
    },
    // in suspected devices array we are storing those devices in which banned user logged in before he made fraudlent activity.so we need to logout all the suspected devices and ask them to verify there face again to prove app that they are not fraud.after that remove there device from suspected devices. 
    suspected_devices: [{
        device_fingerprint: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        suspected_at: {
            type: Date,
            default: Date.now
        }
    }]
})

export default mongoose.model("BannedDevice", BannedDeviceSchema)