// backend\src\controllers\orderController.js
import PickUp from "../models/PickupRequest.js";  
import User from "../models/User.js";                 

 
export const pickup = async (req, res) => {
    try {
        const {
            vendor,
            delivery_partner,
            item_name,
            block,
            floor,
            room,
            screenshot_url,
            currentLocation,
            role
        } = req.body;

        
      

        
        const user =req.user

        // 4. Validate Input Data
        if (!vendor || !delivery_partner || !item_name || !block || !floor || !room || !screenshot_url) {
            return res.status(400).json({ message: "All fields including screenshot are required" });
        }

        // 5. Create Pickup Request Record in MongoDB
        const newPickup = await PickUp.create({
  client_id: user.id,
  details: {
    vendor,
    delivery_partner,
    item_name,
    block,
    floor,
    room,
    currentLocation: {
      type: 'Point',
      coordinates: currentLocation?.coordinates || [0, 0]
    },
    screenshot_url
  },
  status: "PENDING"
});

const io=req.app.get("io");
io.emit("newPickup", newPickup);
        return res.status(201).json({
            success: true,
            message: "Pickup request created successfully",
            data:newPickup
        });

    } catch (error) {
        console.error("Error creating pickup request:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};