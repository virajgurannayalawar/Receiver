import mongoose from "mongoose";

const OrderSchema=new mongoose.Schema({
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMMITTED', 'PICKED_UP', 'ARRIVED', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
      default: 'PENDING',
      uppercase: true,
      trim: true
    },
    details: {
      vendor: {
        type: String,
        required: [true, 'Vendor name is required'],
        trim: true
      },
      location: {
        type: String,
        required: [true, 'Location details are required'],
        trim: true
      },
      screenshot_url: {
        type: String,
        trim: true
      }
    },
    security: {
      release_pin: {
        type: String,
        required: [true, 'Release PIN is required']
      },
      pin_attempts: {
        type: Number,
        default: 0
      }
    },
    timestamps: {
      arrived_at: {
        type: Date
      },
      completed_at: {
        type: Date
      }
    }
  },
  {
    // Automatically creates and manages 'createdAt' and 'updatedAt' fields at the root level
    timestamps: true 
    
})

export default mongoose.model("Order",OrderSchema)