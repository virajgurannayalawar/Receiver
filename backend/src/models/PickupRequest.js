import mongoose from "mongoose";

const PickUp  = new mongoose.Schema({
  requester_id: {
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
    enum: ["REQUESTED", 'PENDING', 'ACCEPTED', 'PICKED_UP', 'ARRIVED', 'DELIVERED', 'CANCELLED', 'DISPUTED'],
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
    delivery_partner: {
      type: String,
      required: [true, 'deliviery partenr name is required'],
      trim: true
    },
    item_name: {
      type: String,
      required: [true, 'item  name is required'],
      trim: true
    },
        item_weight: {
      type: Number,
      required: [true, 'item  weight is required'],
      trim: true
    },
        arrival_time: {
      type: Number,
      required: [true, 'arrival time  is required'],
      trim: true
    },
    block: {
      type: String,
      required: [true, 'block name is required'],
      trim: true
    },
    floor: {
      type: String,
      required: [true, 'floor name is required'],
      trim: true
    },
    room: {
      type: String,
      required: [true, 'room name is required'],
      trim: true
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    screenshot_url: {
      type: String,
      trim: true
    }
  },
  security: {
    release_pin: {
      type: String,
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

    timestamps: true

  })



export default mongoose.model("PickUp", PickUp)