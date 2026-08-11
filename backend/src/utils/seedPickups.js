import mongoose from "mongoose";
import dotenv from "dotenv";
import ConnectDB from "../config/db.js";
import User from "../models/User.js";
import PickUp from "../models/PickupRequest.js";

dotenv.config();

const seedPickupRequests = async () => {
  try {
    await ConnectDB();

    // Find or create a user to act as requester_id
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: "Demo Student",
        email: "demo.student@example.com",
        phone: "9998887770",
        roles: ["requester"],
        currentRole: "requester",
      });
      console.log("Created dummy user for seed data:", user._id);
    } else {
      console.log("Using existing user for seed data:", user._id);
    }

    // Optional: Clear existing PENDING requests to refresh dummy data
    await PickUp.deleteMany({ status: "PENDING" });
    console.log("Cleared old PENDING pickup requests.");

    const vendors = ["Amazon", "Flipkart", "Swiggy", "Zomato", "Myntra", "Blue Dart", "Meesho", "Blinkit"];
    const partners = ["Dunzo", "Shadowfax", "Delhivery", "Ekart", "Porter", "Xpressbees"];
    const items = [
      "MacBook Pro", "Wireless Headphones", "Mechanical Keyboard", "Pizza Box", 
      "Sneakers", "Textbooks", "Water Bottle", "Backpack", "Smartwatch", "Gaming Mouse",
      "Winter Jacket", "Desk Lamp", "Power Bank", "Monitor Stand", "Coffee Mug",
      "Running Shoes", "Bluetooth Speaker", "Tablet", "HDMI Cable", "Desk Pad"
    ];
    const blocks = ["Block A", "Block B", "Block C", "Block D", "LH-1"];
    const floors = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];
    const rooms = ["101", "204", "305", "410", "502", "112", "220"];

    // Distinct arrival times (in minutes) and weights (in kg)
    const arrivalTimes = [5, 8, 12, 15, 18, 22, 25, 28, 32, 35, 40, 45, 50, 55, 60, 65, 70, 75, 85, 95];
    const itemWeights = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 1.2, 2.3, 3.1, 0.8, 4.2, 1.8, 2.7, 3.9, 0.6, 5.5];

    const dummyRequests = [];

    for (let i = 0; i < 20; i++) {
      dummyRequests.push({
        requester_id: user._id,
        status: "PENDING",
        details: {
          vendor: vendors[i % vendors.length],
          delivery_partner: partners[i % partners.length],
          item_name: items[i],
          item_weight: itemWeights[i],
          arrival_time: arrivalTimes[i],
          block: blocks[i % blocks.length],
          floor: floors[i % floors.length],
          room: rooms[i % rooms.length],
          currentLocation: {
            type: "Point",
            coordinates: [77.5946 + i * 0.001, 12.9716 + i * 0.001],
          },
          screenshot_url: "https://via.placeholder.com/150",
        },
      });
    }

    // Insert dummy pickup requests
    const inserted = await PickUp.insertMany(dummyRequests);
    console.log(`Successfully created and inserted ${inserted.length} dummy pickup requests!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding pickup requests:", error);
    process.exit(1);
  }
};

seedPickupRequests();
