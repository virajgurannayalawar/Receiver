// backend\src\controllers\orderController.js
import PickUp from "../models/PickupRequest.js";  
import User from "../models/User.js";                 

 
export const pickup = async (req, res) => {
    try {
        const {
            vendor,
            delivery_partner,
            item_name,
            item_weight,
            arrival_time,
            block,
            floor,
            room,
            screenshot_url,
            currentLocation,
            roles
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
    item_weight,
    arrival_time,
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



// Get all active (pending) pickups
export const activePickups = async (req, res) => {
  try {
    const pickups = await PickUp.find({ status: "PENDING" })
      .populate("client_id", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pickups.length,
      data: pickups,
    });
  } catch (error) {
    console.error("Error fetching active pickups:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active pickups",
      error: error.message,
    });
  }
};

// Fetch all pending pickup requests sorted descending by arrival_time
export const fetchPickupRequests = async (req, res) => {
  try {
    const pickupReqs = await PickUp.find({ status: "PENDING" })
      .populate("requester_id", "name email phone")
      .sort({ "details.arrival_time": -1 });

    return res.status(200).json({
      success: true,
      count: pickupReqs.length,
      pickupReqs,
    });
  } catch (error) {
    console.error("Error fetching pending pickup requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pickup requests",
      error: error.message,
    });
  }
};

// Assign receiver to pickup request and set status to ACCEPTED
export const assignReceiver = async (req, res) => {
  try {
    const { pickup_id, pickupId } = req.body;
    const id = pickup_id || pickupId;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Pickup ID (pickup_id) is required",
      });
    }

    const pickupReq = await PickUp.findById(id);

    if (!pickupReq) {
      return res.status(404).json({
        success: false,
        message: "Pickup request not found",
      });
    }

    pickupReq.status = "ACCEPTED";
    pickupReq.receiver_id = req.user.id || req.user._id;

    await pickupReq.save();

    return res.status(200).json({
      success: true,
      message: "Pickup request accepted successfully",
      data: pickupReq,
    });
  } catch (error) {
    console.error("Error in assignReceiver:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Fetch active tasks assigned to the current receiver
export const fetchActiveTask = async (req, res) => {
  try {
    const receiverId = req.user.id || req.user._id;

    const activeTasks = await PickUp.find({
      receiver_id: receiverId,
      status: "ACCEPTED",
    })
      .populate("requester_id", "name email phone")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: activeTasks.length,
      activeTasks,
    });
  } catch (error) {
    console.error("Error fetching active tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active tasks",
      error: error.message,
    });
  }
};

// Fetch active requests created by the current requester
export const fetchActiveReq = async (req, res) => {
  try {
    const requesterId = req.user.id || req.user._id;

    const activeReqs = await PickUp.find({
      $or: [{ requester_id: requesterId }, { client_id: requesterId }],
      status: { $in: ["PENDING", "ACCEPTED", "PICKED_UP", "ARRIVED"] }
    })
      .populate("receiver_id", "name email phone")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: activeReqs.length,
      activeReqs,
    });
  } catch (error) {
    console.error("Error fetching active requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active requests",
      error: error.message,
    });
  }
};



