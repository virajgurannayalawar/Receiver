import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    phone: { 
      type: String,
      required: false,
      unique: true,
      index: true,
      trim: true,
      sparse: true
    },
    email:{
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
      trim: true
    },
    password: {
      type: String,
      required: false, // Must be false so Google users (who don't have passwords initially) can register and then we can add it afterwards
      trim: true
    },
    name: {
      type: String, 
      trim: true
    }, 
    profile_picture: {
      type: String,
      default: "/profile/avatar.png" // Fallback placeholder
    },
    google: {
      id: {
        type: String,
        unique: true,
        sparse: true,
        index: true
      },
      picture: {
        type: String
      }
    },
      token_version: {
      type: Number,
      default: 0
    },
    roles: {
      type: String, 
      enum: ['client', 'receiver', 'admin'],
      default: 'client'
    },
    security: {
      device_fingerprints: [{
        type: String, //i got to know that values are case sensitive
        index: true
      }],
      is_user_banned: {
        type: Boolean,
        default: false
      },
      ban_reason: {
        type: String
      },
      fcm_token: {
        type: String
      },
      // Added fields for face validation
      face_verification: {
        is_registered: {
          type: Boolean,
          default: false 
        },
        biometric_template_id: {
          type: String 
        }
    }
    },
    financials: {
      wallet_balance: {
        type: Number,
        default: 0
      },
      debt: {
        type: Number,
        default: 0
      }
    },
    receiver_profile: {
      usn: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null/missing values for non-receiver
      },
      id_card_url: {
        type: String
      },
      is_verified: {
        type: Boolean,
        default: false
      },
      rating: {
        type: Number,
        default: 0.5
      }
    }
  },
  {
    timestamps: true 
  
  }
);

export default mongoose.model("User", UserSchema);
