import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://virajgurannayalawar:yLhwBRzEFeId7LkJ@cluster0.hnaifai.mongodb.net/Receiver?appName=Cluster0";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  roles: [String],
  currentRole: String
}, { timestamps: true });

const PickUpSchema = new mongoose.Schema({
  requester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ["REQUESTED", 'PENDING', 'ACCEPTED', 'PICKED_UP', 'ARRIVED', 'DELIVERED', 'CANCELLED', 'DISPUTED'],
    default: 'PENDING',
    uppercase: true,
    trim: true
  },
  details: {
    vendor: { type: String, required: true },
    delivery_partner: { type: String, required: true },
    item_name: { type: String, required: true },
    item_weight: { type: Number, required: true },
    arrival_time: { type: Number, required: true },
    block: { type: String, required: true },
    floor: { type: String, required: true },
    room: { type: String, required: true },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    screenshot_url: { type: String }
  }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const PickUp = mongoose.model('PickUp', PickUpSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB database");

    // Find existing user or create a demo user
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: "Viraj (Demo)",
        email: "viraj.demo@dsi.edu",
        phone: "9876543210",
        roles: ["requester", "receiver"],
        currentRole: "receiver"
      });
      console.log("Created demo user:", user._id);
    } else {
      console.log("Using user ID:", user._id, "(", user.name || user.email, ")");
    }

    const sampleRequests = [
      {
        requester_id: user._id,
        receiver_id: user._id,
        status: "ACCEPTED",
        details: {
          vendor: "Amazon",
          delivery_partner: "Ramesh Kumar (Amazon)",
          item_name: "Algorithms & Data Structures Textbook",
          item_weight: 1.5,
          arrival_time: 15,
          block: "New CSE Building",
          floor: "3",
          room: "304",
          currentLocation: {
            type: "Point",
            coordinates: [77.56598646868318, 12.907648352297038]
          },
          screenshot_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
        }
      },
      {
        requester_id: user._id,
        receiver_id: user._id,
        status: "ACCEPTED",
        details: {
          vendor: "Blinkit",
          delivery_partner: "Suresh (Blinkit)",
          item_name: "Cold Coffee & Energy Bars Box",
          item_weight: 0.8,
          arrival_time: 10,
          block: "Girls Hostel",
          floor: "2",
          room: "212",
          currentLocation: {
            type: "Point",
            coordinates: [77.56646973531326, 12.907646674062565]
          },
          screenshot_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
        }
      },
      {
        requester_id: user._id,
        status: "PENDING",
        details: {
          vendor: "Flipkart",
          delivery_partner: "Ekart Logistics",
          item_name: "Wireless Ergonomic Mouse",
          item_weight: 0.3,
          arrival_time: 25,
          block: "DSI Library",
          floor: "1",
          room: "Reading Room 2",
          currentLocation: {
            type: "Point",
            coordinates: [77.56716280659134, 12.909230189235593]
          },
          screenshot_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
        }
      },
      {
        requester_id: user._id,
        status: "PENDING",
        details: {
          vendor: "Swiggy Instamart",
          delivery_partner: "Swiggy Rider",
          item_name: "IoT Microcontroller Board Kit",
          item_weight: 1.2,
          arrival_time: 8,
          block: "ECE Department",
          floor: "4",
          room: "401",
          currentLocation: {
            type: "Point",
            coordinates: [77.56555132412295, 12.907643116254874]
          },
          screenshot_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
        }
      },
      {
        requester_id: user._id,
        receiver_id: user._id,
        status: "ACCEPTED",
        details: {
          vendor: "Zepto",
          delivery_partner: "Zepto Express",
          item_name: "Project Presentation Sticky Notes & Pens",
          item_weight: 0.5,
          arrival_time: 12,
          block: "Department of Management Studies",
          floor: "2",
          room: "205",
          currentLocation: {
            type: "Point",
            coordinates: [77.56817706454767, 12.908681343336017]
          },
          screenshot_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
        }
      }
    ];

    const inserted = await PickUp.insertMany(sampleRequests);
    console.log(`\nSuccessfully inserted ${inserted.length} sample pickup requests into MongoDB!`);
    inserted.forEach((item, idx) => {
      console.log(`${idx + 1}. [ID: ${item._id}] ${item.details.item_name} | Block: ${item.details.block} | Status: ${item.status}`);
    });

  } catch (err) {
    console.error("Error inserting sample pickup requests:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

run();
