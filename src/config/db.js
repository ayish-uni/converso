import mongoose from "mongoose";

import { MongoMemoryServer } from "mongodb-memory-server";

export async function connectDb(mongoUri) {
  mongoose.set("strictQuery", true);
  try {
    console.log(`[DB] Attempting to connect to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log("[DB] Connected to MongoDB locally/remotely.");
  } catch (error) {
    if (error.name === "MongooseServerSelectionError" || error.message.includes("ECONNREFUSED")) {
      console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.warn("[DB] CRITICAL WARNING: Main MongoDB connection failed.");
      console.warn("[DB] FALLING BACK TO IN-MEMORY DATABASE.");
      console.warn("[DB] DATA WILL BE LOST EVERY TIME THE SERVER RESTARTS.");
      console.warn("[DB] To fix this, please ensure your local MongoDB service is running");
      console.warn("[DB] or provide a valid persistent MONGO_URI in your .env file.");
      console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      
      const mongoServer = await MongoMemoryServer.create();
      const fallbackUri = mongoServer.getUri();
      console.log(`[DB] Fallback in-memory MongoDB started at: ${fallbackUri}`);
      await mongoose.connect(fallbackUri);
      console.log("[DB] Connected to fallback in-memory MongoDB.");
    } else {
      throw error;
    }
  }
}

